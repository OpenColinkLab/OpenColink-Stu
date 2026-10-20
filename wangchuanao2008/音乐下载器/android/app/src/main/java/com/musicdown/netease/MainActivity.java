package com.musicdown.netease;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import android.webkit.CookieManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.app.AlertDialog;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends Activity {
    private static final int PICK_FOLDER = 41;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable delayedEnqueue = this::enqueueInput;

    private SharedPreferences settings;
    private DownloadEngine engine;
    private AccountStore accountStore;
    private Models.Account account;
    private TextView accountStatus;
    private Button accountLoginButton;
    private Button accountLogoutButton;
    private EditText input;
    private TextView folderLabel;
    private TextView notice;
    private LinearLayout taskList;
    private CheckBox mp3;
    private final List<TaskRow> rows = new ArrayList<>();
    private Uri folderUri;
    private boolean clearing;
    private boolean folderPickerOpen;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        settings = getSharedPreferences("settings", MODE_PRIVATE);
        engine = new DownloadEngine(this);
        accountStore = new AccountStore(this);
        account = accountStore.load();
        String saved = settings.getString("folder_uri", "");
        if (!saved.trim().isEmpty()) folderUri = Uri.parse(saved);
        if (folderUri != null && !hasFolderGrant(folderUri)) {
            folderUri = null;
            settings.edit().remove("folder_uri").apply();
        }
        buildUi();
        receiveShare(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        receiveShare(intent);
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(delayedEnqueue);
        if (isFinishing()) engine.shutdown();
        super.onDestroy();
    }

    @Override
    @SuppressLint("WrongConstant")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != PICK_FOLDER) return;
        folderPickerOpen = false;
        if (resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri selected = data.getData();
        int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        try {
            getContentResolver().takePersistableUriPermission(selected, flags);
            folderUri = selected;
            settings.edit().putString("folder_uri", selected.toString()).apply();
            folderLabel.setText(readableFolder(selected));
            notice.setText("目录已授权；点击“解析歌曲”获取歌曲与音质目录");
        } catch (SecurityException e) {
            Toast.makeText(this, "无法保留该目录授权，请重新选择", Toast.LENGTH_LONG).show();
        }
    }

    private void buildUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        // Android 15 enforces edge-to-edge for targetSdk 35. Keep system bars and cutouts
        // outside the scrollable content so the heading stays clear even after scrolling.
        scroll.setOnApplyWindowInsetsListener((view, insets) -> {
            int left, top, right, bottom;
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(android.view.WindowInsets.Type.systemBars()
                        | android.view.WindowInsets.Type.displayCutout() | android.view.WindowInsets.Type.ime());
                left = safe.left; top = safe.top; right = safe.right; bottom = safe.bottom;
            } else {
                left = insets.getSystemWindowInsetLeft(); top = insets.getSystemWindowInsetTop();
                right = insets.getSystemWindowInsetRight(); bottom = insets.getSystemWindowInsetBottom();
            }
            view.setPadding(left, top, right, bottom);
            return insets.consumeSystemWindowInsets();
        });
        LinearLayout root = vertical();
        root.setPadding(dp(18), dp(18), dp(18), dp(28));
        root.setBackgroundColor(Color.rgb(247, 249, 252));
        scroll.addView(root, new ScrollView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView title = text("网易云音乐下载器 " + BuildConfig.VERSION_NAME, 26, Color.rgb(29, 35, 45));
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        root.addView(title);
        TextView subtitle = text("粘贴网易云单曲链接或整段分享文字，支持一次粘贴多条。", 14, Color.rgb(102, 110, 124));
        root.addView(subtitle, margins(-1, -2, 0, 4, 0, 14));

        LinearLayout folderRow = horizontal();
        folderLabel = text(folderUri == null ? "首次使用请选择保存目录" : readableFolder(folderUri), 14, Color.rgb(50, 105, 160));
        folderLabel.setSingleLine(true);
        folderLabel.setEllipsize(android.text.TextUtils.TruncateAt.MIDDLE);
        folderRow.addView(folderLabel, new LinearLayout.LayoutParams(0, dp(48), 1));
        Button choose = button("选择目录");
        choose.setOnClickListener(v -> chooseFolder());
        folderRow.addView(choose);
        root.addView(folderRow);

        LinearLayout accountRow = horizontal();
        accountStatus = text(accountLabel(), 13, Color.rgb(80, 91, 110));
        accountRow.addView(accountStatus, new LinearLayout.LayoutParams(0, dp(48), 1));
        accountLoginButton = button(account == null ? "官网登录" : "切换账号");
        accountLoginButton.setOnClickListener(v -> openLogin()); accountRow.addView(accountLoginButton);
        accountLogoutButton = button("退出"); accountLogoutButton.setEnabled(account != null);
        accountLogoutButton.setOnClickListener(v -> { accountStore.clear(); account = null; updateAccountUi(); });
        accountRow.addView(accountLogoutButton); root.addView(accountRow);

        input = new EditText(this);
        input.setTextSize(15);
        input.setGravity(Gravity.TOP | Gravity.START);
        input.setHint("把网易云分享链接或整段分享文字粘贴到这里…");
        input.setMinLines(3);
        input.setMaxLines(6);
        input.setPadding(dp(12), dp(10), dp(12), dp(10));
        input.setBackground(roundRect(Color.WHITE, Color.rgb(205, 213, 224), 10));
        root.addView(input, margins(-1, -2, 0, 6, 0, 10));
        input.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (clearing) return;
                handler.removeCallbacks(delayedEnqueue);
                handler.postDelayed(delayedEnqueue, 700);
            }
            @Override public void afterTextChanged(Editable s) {}
        });

        LinearLayout optionRow = horizontal();
        Button add = button("解析歌曲");
        add.setOnClickListener(v -> enqueueInput());
        optionRow.addView(add);
        root.addView(optionRow);
        mp3 = new CheckBox(this); mp3.setText("转换为 MP3（转换后为有损音频）");
        mp3.setChecked(settings.getBoolean("mp3", false));
        mp3.setOnCheckedChangeListener((button, checked) -> settings.edit().putBoolean("mp3", checked).apply());
        root.addView(mp3);
        Button all = button("下载全部已选音质");
        all.setOnClickListener(v -> { for (TaskRow row : rows) if (row.download.isEnabled()) row.startDownload(); });
        root.addView(all);

        notice = text("解析只查询信息、封面和音质目录；选择音质并点击下载后才开始", 13, Color.rgb(102, 110, 124));
        root.addView(notice, margins(-1, -2, 0, 5, 0, 12));

        TextView listTitle = text("下载列表", 18, Color.rgb(29, 35, 45));
        listTitle.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        root.addView(listTitle);
        taskList = vertical();
        root.addView(taskList, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(scroll);
        scroll.requestApplyInsets();
    }

    private void chooseFolder() {
        if (folderPickerOpen) return;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        folderPickerOpen = true;
        startActivityForResult(intent, PICK_FOLDER);
    }

    private void enqueueInput() {
        handler.removeCallbacks(delayedEnqueue);
        String text = input.getText().toString().trim();
        if (text.isEmpty()) return;
        List<String> urls = LinkParser.extract(text);
        if (urls.isEmpty()) {
            notice.setText("没有找到 http(s) 歌曲链接");
            return;
        }
        clearing = true; input.setText(""); clearing = false;
        for (String url : urls) addTask(url);
        notice.setText("正在解析 " + urls.size() + " 条链接；下载尚未开始");
    }

    private void addTask(String url) {
        TaskRow row = new TaskRow(url);
        rows.add(row);
        taskList.addView(row.root, 0, margins(-1, -2, 0, 5, 0, 8));
        row.preview();
    }

    private void receiveShare(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction()) || !"text/plain".equals(intent.getType())) return;
        String shared = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (shared != null && input != null) input.setText(shared);
    }

    private String readableFolder(Uri uri) {
        String last = uri.getLastPathSegment();
        return last == null ? uri.toString() : "保存到：" + Uri.decode(last.replace("primary:", "内部存储/"));
    }

    private boolean hasFolderGrant(Uri uri) {
        try {
            for (android.content.UriPermission permission : getContentResolver().getPersistedUriPermissions())
                if (permission.getUri().equals(uri) && permission.isWritePermission()) return true;
        } catch (SecurityException ignored) {}
        return false;
    }

    private String accountLabel() { return account == null ? "网易云账号：未登录" : "网易云账号：" + account.nickname + "（会话已保存）"; }

    private void updateAccountUi() {
        if (accountStatus != null) accountStatus.setText(accountLabel());
        if (accountLoginButton != null) accountLoginButton.setText(account == null ? "官网登录" : "切换账号");
        if (accountLogoutButton != null) accountLogoutButton.setEnabled(account != null);
    }

    private void openLogin() {
        LinearLayout panel = vertical(); panel.setPadding(dp(12), dp(8), dp(12), 0);
        TextView hint = text("已直接打开网易云官方登录页，请扫码并完成安全验证。", 14, Color.rgb(75, 82, 96));
        panel.addView(hint);
        WebView web = new WebView(this);
        WebSettings settingsWeb = web.getSettings();
        // JavaScript is required by NetEase's official login and security-verification pages.
        settingsWeb.setJavaScriptEnabled(true); settingsWeb.setDomStorageEnabled(true);
        // Request the dedicated desktop login route: the default Android UA is redirected
        // by NetEase to its mobile homepage. Adapt only the login layout below.
        settingsWeb.setUserAgentString("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");
        settingsWeb.setUseWideViewPort(true); settingsWeb.setLoadWithOverviewMode(true);
        settingsWeb.setBuiltInZoomControls(true); settingsWeb.setDisplayZoomControls(false);
        settingsWeb.setAllowFileAccess(false); settingsWeb.setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String address) {
                Uri page = Uri.parse(address);
                if (!"music.163.com".equals(page.getHost())) return;
                if (!"/login".equals(page.getPath()) && !"/login".equals(page.getFragment())) return;
                try (java.io.InputStream script = getAssets().open("login_layout.js")) {
                    view.evaluateJavascript(readLoginLayout(script), null);
                } catch (java.io.IOException e) {
                    hint.setText("登录布局加载失败；可双指缩放网页后扫码");
                }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest request) {
                Uri uri = request.getUrl(); String host = uri.getHost();
                return !"https".equalsIgnoreCase(uri.getScheme()) || host == null ||
                        !isOfficialLoginHost(host);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String address) {
                Uri uri = Uri.parse(address); String host = uri.getHost();
                return !"https".equalsIgnoreCase(uri.getScheme()) || host == null ||
                        !isOfficialLoginHost(host);
            }
        });
        CookieManager.getInstance().setAcceptCookie(true);
        web.loadUrl("https://music.163.com/#/login"); panel.addView(web, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                dp(Math.max(200, getResources().getConfiguration().screenHeightDp - 180)), 1));
        AlertDialog dialog = new AlertDialog.Builder(this).setTitle("网易云官网登录")
                .setView(panel).setNegativeButton("关闭", (d, w) -> {
                    CookieManager.getInstance().removeAllCookies(null);
                })
                .setPositiveButton("完成登录并校验", null).create();
        dialog.setOnShowListener(ignored -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String cookie = CookieManager.getInstance().getCookie("https://music.163.com");
            String musicU = cookieValue(cookie, "MUSIC_U"), csrf = cookieValue(cookie, "__csrf");
            if (musicU.isEmpty()) { Toast.makeText(this, "官方网页尚未返回登录会话，请先完成登录和验证", Toast.LENGTH_LONG).show(); return; }
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(false);
            ExecutorService worker = Executors.newSingleThreadExecutor();
            worker.execute(() -> {
                try {
                    Models.Account validated = MusicApi.validateSession(musicU, csrf);
                    accountStore.save(validated);
                    CookieManager.getInstance().removeAllCookies(null);
                    ui(() -> {
                        account = validated; updateAccountUi();
                        Toast.makeText(this, "已登录：" + validated.nickname, Toast.LENGTH_LONG).show();
                        dialog.dismiss();
                    });
                } catch (Models.AppException e) {
                    ui(() -> { dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(true); Toast.makeText(this, e.getMessage(), Toast.LENGTH_LONG).show(); });
                } catch (Exception e) {
                    ui(() -> { dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(true); Toast.makeText(this, "无法安全保存登录会话", Toast.LENGTH_LONG).show(); });
                } finally { worker.shutdown(); }
            });
        }));
        dialog.setOnDismissListener(ignored -> {
            CookieManager.getInstance().removeAllCookies(null);
            web.stopLoading(); web.destroy();
        });
        dialog.show();
        if (dialog.getWindow() != null) dialog.getWindow().setLayout(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    }

    private static String readLoginLayout(java.io.InputStream script) throws java.io.IOException {
        java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
        byte[] chunk = new byte[4096]; int count;
        while ((count = script.read(chunk)) != -1) buffer.write(chunk, 0, count);
        return buffer.toString("UTF-8");
    }

    private static String cookieValue(String header, String key) {
        if (header == null) return "";
        for (String item : header.split(";")) {
            String[] pair = item.trim().split("=", 2);
            if (pair.length == 2 && pair[0].equals(key)) return pair[1];
        }
        return "";
    }

    private static boolean isOfficialLoginHost(String host) {
        return host.equals("music.163.com") || host.endsWith(".music.163.com") ||
                host.equals("passport.163.com") || host.equals("auth.163.com") || host.equals("st.163.com");
    }

    private final class TaskRow {
        final String url;
        final LinearLayout root = vertical();
        final ImageView cover = new ImageView(MainActivity.this);
        final TextView songTitle = text("等待解析", 16, Color.rgb(25, 31, 40));
        final TextView meta;
        final TextView quality = text("音质目录待查询", 13, Color.rgb(65, 83, 103));
        final Spinner qualityPicker = new Spinner(MainActivity.this);
        final TextView state = text("等待解析", 13, Color.rgb(55, 104, 150));
        final ProgressBar progress = new ProgressBar(MainActivity.this, null, android.R.attr.progressBarStyleHorizontal);
        final Button cancel = button("取消");
        final Button retry = button("重试");
        final Button download = button("下载");
        final Button open = button("打开文件");
        Models.Control control;
        Models.Result result;
        Models.Song song;
        android.graphics.Bitmap coverBitmap;
        boolean downloading;
        List<String> selectedLevels = new ArrayList<>();

        TaskRow(String url) {
            this.url = url;
            this.meta = text(urlPlaceholder(), 13, Color.rgb(100, 108, 120));
            root.setPadding(dp(12), dp(12), dp(12), dp(10));
            root.setBackground(roundRect(Color.WHITE, Color.rgb(219, 224, 232), 10));
            LinearLayout top = horizontal();
            cover.setImageResource(android.R.drawable.ic_media_play);
            cover.setScaleType(ImageView.ScaleType.CENTER_CROP);
            top.addView(cover, new LinearLayout.LayoutParams(dp(58), dp(58)));
            LinearLayout info = vertical();
            info.setPadding(dp(10), 0, 0, 0);
            info.addView(songTitle);
            info.addView(meta);
            info.addView(quality);
            info.addView(qualityPicker);
            top.addView(info, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            root.addView(top);
            progress.setMax(100);
            progress.setProgress(0);
            root.addView(progress, margins(-1, dp(6), 0, 6, 0, 3));
            root.addView(state);
            LinearLayout actions = horizontal();
            actions.setGravity(Gravity.END);
            retry.setEnabled(false);
            download.setEnabled(false);
            cancel.setEnabled(false);
            open.setEnabled(false);
            cancel.setOnClickListener(v -> {
                if (control != null) control.cancelled.set(true);
                state.setText("正在取消…");
                cancel.setEnabled(false);
            });
            retry.setOnClickListener(v -> { if (song == null) preview(); else startDownload(); });
            download.setOnClickListener(v -> startDownload());
            open.setOnClickListener(v -> openResult());
            actions.addView(cancel);
            actions.addView(retry);
            actions.addView(download);
            actions.addView(open);
            root.addView(actions);
        }

        private String urlPlaceholder() {
            return url.length() > 58 ? url.substring(0, 55) + "…" : url;
        }

        void preview() {
            state.setText("查询歌曲信息与音质目录…"); retry.setEnabled(false); download.setEnabled(false); cancel.setEnabled(true);
            control = engine.preview(url, new DownloadEngine.Listener() {
                @Override public void state(String text) { ui(() -> state.setText(text)); }
                @Override public void song(Models.Song song, android.graphics.Bitmap bitmap) {
                    ui(() -> {
                        songTitle.setText(song.title);
                        meta.setText(song.artist + (song.album.trim().isEmpty() ? "" : " · " + song.album));
                        if (bitmap != null) { coverBitmap = bitmap; cover.setImageBitmap(bitmap); }
                    });
                }
                @Override public void catalog(Models.Song ready, android.graphics.Bitmap bitmap, boolean failed) {
                    ui(() -> {
                        if (ready == null) { cancel.setEnabled(false); retry.setText("重试目录"); retry.setEnabled(true); quality.setText("音质目录获取失败"); return; }
                        song = ready; selectedLevels.clear();
                        List<String> labels = new ArrayList<>(); labels.add("选择音质…"); selectedLevels.add("");
                        if (!ready.qualities.isEmpty()) { labels.add("自动（普通音质优先）"); selectedLevels.add("auto"); }
                        labels.add("备用音源（GD Studio · 实际音质以文件为准）"); selectedLevels.add("alternate");
                        for (String level : MusicApi.QUALITY_ORDER) if (ready.qualities.containsKey(level)) {
                            labels.add(ready.qualities.get(level)); selectedLevels.add(level);
                        }
                        qualityPicker.setAdapter(new ArrayAdapter<>(MainActivity.this, android.R.layout.simple_spinner_dropdown_item, labels));
                        qualityPicker.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
                            @Override public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                                download.setEnabled(song != null && position > 0 && !downloading && result == null);
                            }
                            @Override public void onNothingSelected(android.widget.AdapterView<?> parent) { download.setEnabled(false); }
                        });
                        quality.setText("该曲可选档位 · 目录不代表账号已获授权");
                        state.setText("等待选择音质；进度 0%"); retry.setEnabled(false); retry.setText("重试"); cancel.setEnabled(false);
                        progress.setProgress(0); progress.setIndeterminate(false);
                    });
                }
                @Override public void progress(int percent) {
                    ui(() -> {
                        progress.setIndeterminate(percent < 0);
                        if (percent >= 0) progress.setProgress(percent);
                    });
                }
                @Override public void completed(String finalState, Models.Result finalResult, String message) {
                    ui(() -> finish(finalState, finalResult, message));
                }
            });
        }

        private void startDownload() {
            if (downloading || song == null || qualityPicker.getSelectedItemPosition() <= 0) return;
            if (folderUri == null) { notice.setText("下载前请先选择保存目录"); chooseFolder(); return; }
            String level = selectedLevels.get(qualityPicker.getSelectedItemPosition());
            downloading = true; qualityPicker.setEnabled(false); result = null; download.setEnabled(false); retry.setEnabled(false); cancel.setEnabled(true); open.setEnabled(false);
            state.setText("已选择 " + (level.equals("auto") ? "自动音质" : level.equals("alternate") ? "备用音源" : song.qualities.get(level)) + "；开始下载");
            control = engine.enqueue(song, folderUri, level, account, mp3.isChecked(), coverBitmap, new DownloadEngine.Listener() {
                @Override public void state(String text) { ui(() -> state.setText(text)); }
                @Override public void song(Models.Song ignored, android.graphics.Bitmap bitmap) {}
                @Override public void catalog(Models.Song ignored, android.graphics.Bitmap bitmap, boolean failed) {}
                @Override public void progress(int percent) { ui(() -> { progress.setIndeterminate(percent < 0); if (percent >= 0) progress.setProgress(percent); }); }
                @Override public void completed(String finalState, Models.Result finalResult, String message) { ui(() -> finish(finalState, finalResult, message)); }
            });
        }

        private void finish(String finalState, Models.Result finalResult, String message) {
            result = finalResult; downloading = false; qualityPicker.setEnabled(true);
            progress.setIndeterminate(false);
            cancel.setEnabled(false);
            boolean success = finalResult != null;
            retry.setEnabled(DownloadRules.retryAllowed(success));
            download.setEnabled(!success && song != null && qualityPicker.getSelectedItemPosition() > 0);
            open.setEnabled(success);
            if (success) {
                progress.setProgress(100);
                quality.setText(finalResult.info.display());
                meta.setText(meta.getText() + "\n" + finalResult.sourceLabel);
                state.setText(finalState + " · " + finalResult.fileName);
                state.setTextColor(Color.rgb(35, 125, 70));
            } else {
                state.setText(finalState + " · " + message);
                state.setTextColor("已取消".equals(finalState) ? Color.rgb(100, 108, 120) : Color.rgb(180, 55, 48));
            }
        }

        private void openResult() {
            if (result == null) return;
            String mime = result.info.mimeType();
            Intent view = new Intent(Intent.ACTION_VIEW).setDataAndType(result.uri, mime)
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            try {
                startActivity(Intent.createChooser(view, "打开音频文件"));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(MainActivity.this, "没有可播放该格式的应用", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void ui(Runnable runnable) { handler.post(runnable); }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private LinearLayout vertical() { LinearLayout v = new LinearLayout(this); v.setOrientation(LinearLayout.VERTICAL); return v; }
    private LinearLayout horizontal() { LinearLayout v = new LinearLayout(this); v.setOrientation(LinearLayout.HORIZONTAL); v.setGravity(Gravity.CENTER_VERTICAL); return v; }
    private TextView text(String value, int sp, int color) { TextView v = new TextView(this); v.setText(value); v.setTextSize(sp); v.setTextColor(color); return v; }
    private Button button(String value) { Button b = new Button(this); b.setText(value); b.setTextSize(13); b.setAllCaps(false); b.setMinHeight(0); b.setMinimumHeight(0); return b; }
    private GradientDrawable roundRect(int fill, int stroke, int radiusDp) { GradientDrawable d = new GradientDrawable(); d.setColor(fill); d.setCornerRadius(dp(radiusDp)); d.setStroke(dp(1), stroke); return d; }
    private LinearLayout.LayoutParams margins(int width, int height, int left, int top, int right, int bottom) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(width < 0 ? ViewGroup.LayoutParams.MATCH_PARENT : width,
                height < 0 ? ViewGroup.LayoutParams.WRAP_CONTENT : height);
        p.setMargins(dp(left), dp(top), dp(right), dp(bottom));
        return p;
    }
}

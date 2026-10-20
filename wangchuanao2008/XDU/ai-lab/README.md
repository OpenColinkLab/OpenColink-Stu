# 机器学习实验

NumPy、Matplotlib 与 scikit-learn 的 Jupyter 笔记本，涵盖 KNN、K-Means、线性回归、决策树和 PCA。

## 环境与启动

使用 Python 3.12，在本目录执行：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m jupyterlab
```

Windows 使用 `.venv\Scripts\python.exe` 替换 `.venv/bin/python`。在 JupyterLab 选择此环境的 Python 内核，打开笔记本后从头按顺序执行单元格。修改后先重启内核，再执行全部单元格，避免依赖旧变量。

## 数据与维护

多数实验使用 scikit-learn 内置数据或生成数据；线性回归中的 `fetch_california_housing()` 首次运行需要联网下载，默认缓存在用户目录的 `scikit_learn_data/`。离线环境应提前准备数据。`test.ipynb` 是草稿，保留供继续编辑。

依赖文件声明兼容范围，尚未锁定完整环境；不同版本的数值结果和图形可能略有差异。本次未执行全部实验，不把安装成功等同于实验结果验收。分享前自行检查笔记本输出中的个人信息。

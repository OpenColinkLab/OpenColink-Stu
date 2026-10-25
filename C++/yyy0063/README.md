# 学生管理系统（C++ + SQLite）

字符界面的学生信息管理程序，数据保存在 SQLite 单文件中，支持增删改查。

## 功能

- 添加学生（学号、姓名、成绩）
- 查看全部学生
- 按学号查找
- 删除学生
- 修改成绩

说明：成绩限制在 0~100 之间；学号唯一，重复提交会被数据库拒绝。

## 开发环境

- 编译器：MinGW-w64 GCC 8.1.0（64 位）
- 数据库：SQLite 3.54.01（amalgamation 源码方式引入）
- 无第三方 C++ 库

## 文件说明

| 文件 | 说明 |
|---|---|
| `main.cpp` | 全部源码 |
| `build.bat` | Windows 一键编译脚本 |
| `data/student.db` | 程序首次运行后自动生成的数据库文件 |

## 编译运行

1. 到 <https://www.sqlite.org/download.html> 下载 `sqlite-amalgamation-*.zip`，解压出 `sqlite3.c` 和 `sqlite3.h` 放到项目根目录。

2. `sqlite3.c` 是 C 代码，必须先用 gcc 单独编译一次：

```
gcc -c sqlite3.c -o sqlite3.o -O2 -D_WIN32_WINNT=0x0601
```

3. 编译自己的源码并链接：

```
g++ -std=c++17 -O2 -static main.cpp sqlite3.o -I. -o sms.exe
```

4. 运行 `sms.exe`。

> `-D_WIN32_WINNT=0x0601` 是必需的。GCC 8.x 默认的 Windows 版本宏过低，不加会报
> `GetTickCount64 undeclared`。

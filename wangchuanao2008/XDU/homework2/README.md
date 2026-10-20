# C / C++ 练习（homework2）

每个源文件是独立练习，通常各有自己的 `main`，不要把所有文件一起链接。需要 C / C++ 编译器；macOS 可通过 Xcode Command Line Tools 提供 Clang，Linux 可使用 GCC，Windows 可使用 MinGW 或 WSL。无第三方包依赖。

## 编译与运行

在本目录选择一个 `.cpp`，例如 `110.cpp`：

```sh
c++ -std=c++17 -Wall -Wextra 110.cpp -o /tmp/exercise
/tmp/exercise
```

`.c` 文件使用 `cc -std=c11 文件.c -o /tmp/exercise`。Windows 可将输出改为 `exercise.exe`。部分练习可能需要 GNU 扩展（如 `bits/stdc++.h`），遇到这类代码请使用 GCC 或改为标准头文件。

题目编号对应源文件名；输入按各程序的 `cin` / `scanf` 读取。此目录没有完整题面、统一样例或自动验收，不能据此认定每题算法正确。修改后至少用题目给定输入和边界输入核验。旧的同名无扩展名编译产物不属于源码，运行前请重新编译。

部分旧源文件使用非 UTF-8 中文编码。例如 `110.cpp` 在 Clang 下可编译，但会产生字符串编码警告；改动前确认原编码，必要时另行转换并核对输出，避免编辑器保存后出现乱码。

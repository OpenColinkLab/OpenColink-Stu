for i in range(9, 0, -1):  # 生成乘数
    for j in range(i, 0, -1):  # 被乘数
        print(f"{i}×{j}={i*j}", end="\t")  # \t输出
    print()

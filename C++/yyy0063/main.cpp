#include <iostream>
#include <string>
#include <windows.h>
#include <sqlite3.h>

void add_student(sqlite3* db) {
    std::string sno, name;
    double score;
    std::cout << "学号 姓名 成绩: ";
    std::cin >> sno >> name >> score;

    if (score < 0 || score > 100) {
        std::cout << "成绩必须在 0~100 之间" << std::endl;
        return;
    }

    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db,
            "INSERT INTO student(sno, name, score) VALUES(?, ?, ?)",
            -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cout << "准备失败: " << sqlite3_errmsg(db) << std::endl;
        return;
    }
    sqlite3_bind_text(stmt, 1, sno.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_double(stmt, 3, score);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_DONE) {
        std::cout << "添加成功" << std::endl;
    } else {
        std::cout << "添加失败: " << sqlite3_errmsg(db) << std::endl;
    }
    sqlite3_finalize(stmt);
}

void list_students(sqlite3* db) {
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db, "SELECT sno, name, score FROM student",
            -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cout << "查询失败" << std::endl;
        return;
    }
    std::cout << "学号\t姓名\t成绩" << std::endl;
    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        std::cout << (const char*)sqlite3_column_text(stmt, 0) << "\t"
                  << (const char*)sqlite3_column_text(stmt, 1) << "\t"
                  << sqlite3_column_double(stmt, 2) << std::endl;
        count++;
    }
    if (count == 0) {
        std::cout << "(还没有学生记录)" << std::endl;
    }
    sqlite3_finalize(stmt);
}

void find_student(sqlite3* db) {
    std::string sno;
    std::cout << "请输入学号: ";
    std::cin >> sno;

    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db,
            "SELECT name, score FROM student WHERE sno = ?",
            -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cout << "查询失败" << std::endl;
        return;
    }
    sqlite3_bind_text(stmt, 1, sno.c_str(), -1, SQLITE_TRANSIENT);

    if (sqlite3_step(stmt) == SQLITE_ROW) {
        std::cout << "姓名: " << (const char*)sqlite3_column_text(stmt, 0) << std::endl;
        std::cout << "成绩: " << sqlite3_column_double(stmt, 1) << std::endl;
    } else {
        std::cout << "未找到该学号的学生" << std::endl;
    }
    sqlite3_finalize(stmt);
}

void delete_student(sqlite3* db) {
    std::string sno;
    std::cout << "要删除的学号: ";
    std::cin >> sno;

    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db, "DELETE FROM student WHERE sno = ?",
            -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cout << "准备失败: " << sqlite3_errmsg(db) << std::endl;
        return;
    }
    sqlite3_bind_text(stmt, 1, sno.c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    if (rc != SQLITE_DONE) {
        std::cout << "删除失败: " << sqlite3_errmsg(db) << std::endl;
    } else if (sqlite3_changes(db) > 0) {
        std::cout << "已删除" << std::endl;
    } else {
        std::cout << "没有这个学号，什么都没删" << std::endl;
    }
    sqlite3_finalize(stmt);
}

void update_score(sqlite3* db) {
    std::string sno;
    double score;
    std::cout << "要修改的学号 新成绩: ";
    std::cin >> sno >> score;

    if (score < 0 || score > 100) {
        std::cout << "成绩必须在 0~100 之间" << std::endl;
        return;
    }

    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db,
            "UPDATE student SET score = ? WHERE sno = ?",
            -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cout << "准备失败: " << sqlite3_errmsg(db) << std::endl;
        return;
    }
    sqlite3_bind_double(stmt, 1, score);
    sqlite3_bind_text(stmt, 2, sno.c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    if (rc != SQLITE_DONE) {
        std::cout << "修改失败: " << sqlite3_errmsg(db) << std::endl;
    } else if (sqlite3_changes(db) > 0) {
        std::cout << "已修改" << std::endl;
    } else {
        std::cout << "没有这个学号" << std::endl;
    }
    sqlite3_finalize(stmt);
}

int main() {
    SetConsoleOutputCP(65001);
    SetConsoleCP(65001);

    sqlite3* db = nullptr;
    if (sqlite3_open("data/student.db", &db) != SQLITE_OK) {
        std::cout << "打开数据库失败" << std::endl;
        return 1;
    }

    const char* sql =
        "CREATE TABLE IF NOT EXISTS student("
        "id INTEGER PRIMARY KEY AUTOINCREMENT,"
        "sno TEXT NOT NULL UNIQUE,"
        "name TEXT NOT NULL,"
        "score REAL)";
    char* err = nullptr;
    if (sqlite3_exec(db, sql, nullptr, nullptr, &err) != SQLITE_OK) {
        std::cout << "建表失败: " << err << std::endl;
        sqlite3_free(err);
        sqlite3_close(db);
        return 1;
    }

    while (true) {
        std::cout << "\n===== 学生管理系统 =====" << std::endl;
        std::cout << "1. 添加学生" << std::endl;
        std::cout << "2. 查看全部" << std::endl;
        std::cout << "3. 按学号查找" << std::endl;
        std::cout << "4. 删除学生" << std::endl;
        std::cout << "5. 修改成绩" << std::endl;
        std::cout << "0. 退出" << std::endl;
        std::cout << "请选择: ";

        int choice = 0;
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore(10000, '\n');
            std::cout << "请输入数字" << std::endl;
            continue;
        }

        if (choice == 0) {
            break;
        } else if (choice == 1) {
            add_student(db);
        } else if (choice == 2) {
            list_students(db);
        } else if (choice == 3) {
            find_student(db);
        } else if (choice == 4) {
            delete_student(db);
        } else if (choice == 5) {
            update_score(db);
        } else {
            std::cout << "没有这个选项" << std::endl;
        }
    }

    sqlite3_close(db);
    std::cout << "再见" << std::endl;
    return 0;
}

money = float(input("请输入本次充值的金额"))
is_new = input("是否为新顾客（是或否）")
subsidy = 0
total = 0
first_gift = 0
if money >= 10000:
    subsidy = 10000
    total = money + subsidy
elif money >= 5000 :
    subsidy = money * 0.2
    total = subsidy + money
elif money >= 3000 :
    subsidy = money *0.18
    total = money + subsidy
elif money >= 1500 :
    subsidy = money * 0.15
    total = money + subsidy
else :
    total= money
if is_new == "是" :
    first_gift = total * 0.1
    total = first_gift + total
    noon = "新"
else :
    noon = "旧"
    first_gift = 0
    total = total + first_gift
message = f"尊敬的{noon}客户,你好!您在本行充值金额{money} 元，共到账{total}元"
print(message)


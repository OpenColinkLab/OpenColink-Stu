import serial as s
import pynmea2 as p
port=s.Serial("/dev/ttyUSB0", 9600, timeout=1)
while True:
    line=port.readline()
    line_1=line.decode("ascii", errors="ignore")
    line_2=line_1.strip()
    try:
        msg=p.parse(line_2)
    except p.ParseError:
        continue
    if msg.sentence_type=="GGA":
        print(msg.latitude,msg.longitude,msg.num_sats,msg.gps_qual)
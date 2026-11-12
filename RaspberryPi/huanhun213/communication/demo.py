import serial
from serial import SerialException

def main(port, baudrate):
    try:
        with serial.Serial(port, baudrate, timeout=1) as ser:
            print(f"Connected to {port} at {baudrate} baud.")

            load = b"Hello, UART!"
            ser.write(load)
            print(f"Sent: {load}")

            line = ser.readline()
            if line:
                print(f"Received: {line}")
            else:
                print("No response received.")

    except SerialException as e:
        print(f"Serial error: {e}")


if __name__ == "__main__":
    port = dev/ttyUSB0  
    baudrate = 9600
    main(port, baudrate)
    
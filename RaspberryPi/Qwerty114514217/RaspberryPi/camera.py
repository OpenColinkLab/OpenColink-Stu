import cv2
import numpy as np
cap=cv2.VideoCapture(0,cv2.CAP_V4L2)
face_cascade=cv2.CascadeClassifier("/home/ge/opencv-haarcascades/haarcascade_frontalface_alt2.xml")
while (1):
    ret,frame=cap.read()
    if ret:
        gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
        faces=face_cascade.detectMultiScale(gray,scaleFactor=1.5,minNeighbors=5)
        for(x,y,w,h) in faces:
            print(x,y,w,h)
            cv2.rectangle(frame,(x,y),(x+w,y+h),(0,255,0),2)
        cv2.imshow("frame",frame)
        cv2.imshow("gray",gray)
    if cv2.waitKey(1)&0xFF==ord('q'):
        break
cap.release()
cv2.destroyAllWindows()
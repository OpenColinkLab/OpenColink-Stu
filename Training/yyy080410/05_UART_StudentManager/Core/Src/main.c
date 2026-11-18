/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2026 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include"string.h"
#include "ReadLine.h"

/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
/* 宏必须放在类型定义之前，而 CubeMX 模板里 PTD 在 PD 前面，
   所以这几个宏放在这里，不能放 PD 区域 */
#define MAX_STU  10
#define ID_LEN   9
#define NAME_LEN 17

typedef struct {
    char id[ID_LEN];
    char name[NAME_LEN];
} Student;
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/
UART_HandleTypeDef huart2;

/* USER CODE BEGIN PV */
Student students[MAX_STU];
uint8_t stu_count = 0;
/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_USART2_UART_Init(void);
/* USER CODE BEGIN PFP */
void    UART_Send(const char *s);
Student* FindById(const char *id);
void    Cmd_Add(char *id, char *name);
void    Cmd_Get(char *id);
void    HandleCommand(char *line);
void Cmd_Del(char *id);
void		Cmd_List(void);
void		Cmd_Set(char *id,char *name);
void		Cmd_Clr(void);
/* USER CODE END PFP */
/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_USART2_UART_Init();
	UART_Send("BOOT v4\r\n");
  /* USER CODE BEGIN 2 */
uint8_t a[2];
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
    char line[64];
    uint8_t r = UART_ReadLine(line, sizeof(line));

    if (r == 1) {
        HandleCommand(line); 
    }
    else if (r == 2) {
        UART_Send("ERR,7\r\n");
    }
  }
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_NONE;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_HSI;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_0) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief USART2 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART2_UART_Init(void)
{

  /* USER CODE BEGIN USART2_Init 0 */

  /* USER CODE END USART2_Init 0 */

  /* USER CODE BEGIN USART2_Init 1 */

  /* USER CODE END USART2_Init 1 */
  huart2.Instance = USART2;
  huart2.Init.BaudRate = 115200;
  huart2.Init.WordLength = UART_WORDLENGTH_8B;
  huart2.Init.StopBits = UART_STOPBITS_1;
  huart2.Init.Parity = UART_PARITY_NONE;
  huart2.Init.Mode = UART_MODE_TX_RX;
  huart2.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart2.Init.OverSampling = UART_OVERSAMPLING_16;
  if (HAL_UART_Init(&huart2) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN USART2_Init 2 */

  /* USER CODE END USART2_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  /* USER CODE BEGIN MX_GPIO_Init_1 */

  /* USER CODE END MX_GPIO_Init_1 */

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOA_CLK_ENABLE();

  /* USER CODE BEGIN MX_GPIO_Init_2 */

  /* USER CODE END MX_GPIO_Init_2 */
}

/* USER CODE BEGIN 4 */
void HandleCommand(char *line)
{
    char *cmd = strtok(line, ",");
    if (cmd == NULL) return;        

    if (strcmp(cmd, "ADD") == 0) {
        char *id   = strtok(NULL, ",");
        char *name = strtok(NULL, ",");
        Cmd_Add(id, name);
    }
    else if (strcmp(cmd, "GET") == 0) {
        char *id = strtok(NULL, ",");
        Cmd_Get(id);
    }
		else if (strcmp(cmd,"DEL")==0) Cmd_Del(strtok(NULL,","));
		else if (strcmp(cmd,"LIST")==0) Cmd_List();
		else if (strcmp(cmd,"SET")==0) {
		        char *id   = strtok(NULL, ",");
        char *name = strtok(NULL, ",");
        Cmd_Set(id, name);}
		else if (strcmp(cmd,"CLR")==0){
		Cmd_Clr();}
    else {
        UART_Send("ERR,1\r\n");
    }
}

void UART_Send(const char *s)
{
    HAL_UART_Transmit(&huart2, (uint8_t *)s, strlen(s), 100);
}



Student* FindById(const char *id)
{
    for (uint8_t i = 0; i < stu_count; i++) {
        if (strcmp(students[i].id, id) == 0)
            return &students[i];
    }
    return NULL;
}


void Cmd_Add(char *id, char *name)
{

    if (id == NULL || name == NULL) {
        UART_Send("ERR,2\r\n");
        return;
    }

    uint8_t len = strlen(id);
    uint8_t i;
    if (len == 0 || len >= ID_LEN) {
    UART_Send("ERR,6\r\n");
    return;
}
    for (i = 0; i < len; i++) {
        if (id[i] < '0' || id[i] > '9') {
            UART_Send("ERR,6\r\n");
            return;
        }
    }

    if (strlen(name) == 0 || strlen(name) >= NAME_LEN) {
        UART_Send("ERR,6\r\n");
        return;
    }


    if (FindById(id) != NULL) {
        UART_Send("ERR,3\r\n");
        return;
    }


    if (stu_count >= MAX_STU) {
        UART_Send("ERR,5\r\n");
        return;
    }


    strcpy(students[stu_count].id, id);
    strcpy(students[stu_count].name, name);
    stu_count++;

    UART_Send("OK,added\r\n");
}


void Cmd_Get(char *id)
{
     if (id == NULL) {
        UART_Send("ERR,2\r\n");
        return;}
    if (FindById(id) == NULL) {
        UART_Send("ERR,4\r\n");
        return;
    }
		Student* s=FindById(id);
    UART_Send("OK,");
    UART_Send(s->id);
    UART_Send(",");
    UART_Send(s->name);
    UART_Send("\r\n");
}
void Cmd_Del(char *id)
{
     if (id == NULL) {
        UART_Send("ERR,2\r\n");
        return;}
    Student *s = FindById(id);
				if(s == NULL){
				UART_Send("ERR,4\r\n");
        return;}
				int idx=s-students;
				students[idx] = students[stu_count - 1];
				stu_count--;
				UART_Send("OK,deleted\r\n");
        return;
}
void Cmd_List(){
	if(stu_count==0){
	UART_Send("NULL\r\n");
	return;}
	
    UART_Send("OK,\r\n");
	for (int i=0;i<stu_count;i++){
		Student* s=&students[i];
    UART_Send(s->id);
    UART_Send(",");
    UART_Send(s->name);
    UART_Send("\r\n");}
}
void Cmd_Set(char *id, char *name)
{
    if (id == NULL || name == NULL) {
        UART_Send("ERR,2\r\n");
        return;
    }

    Student *s = FindById(id);
    if (s == NULL) {
        UART_Send("ERR,4\r\n");
        return;
    }

    if (strlen(name) == 0 || strlen(name) >= NAME_LEN) {
        UART_Send("ERR,6\r\n");
        return;
    }

    strcpy(s->name, name);      
    UART_Send("OK,updated\r\n");
	}	
void	Cmd_Clr(){
	stu_count = 0;
  UART_Send("OK,cleared\r\n");
}


/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}
#ifdef USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */

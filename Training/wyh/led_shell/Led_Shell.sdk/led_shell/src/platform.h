/**
 * @file  platform.h
 * @brief Board bring-up hooks used by main().
 */
#ifndef __PLATFORM_H__
#define __PLATFORM_H__

/**
 * @brief  Called once at the beginning of main(), before any driver is used
 */
void init_platform(void);

/**
 * @brief  Called when the application leaves main() (not used here)
 */
void cleanup_platform(void);

#endif /* __PLATFORM_H__ */

# EBAZ4205 Zynq — LED Control with a Serial Command Shell (letter-shell)

A PS + PL co-design example on the **EBAZ4205** (Zynq-7010) development board.

> Type a command into a serial terminal and the on-board red LED responds
> immediately — blink or change brightness, with no re-flashing required.

- **PS (ARM Cortex-A9)** — [letter-shell](https://github.com/NevermindZZT/letter-shell) 3.2.4 ported to provide a serial command line
- **PL (FPGA)** — `led_ctl.v` implements 1 kHz PWM dimming and precise blink timing
- **Bridge** — AXI GPIO: the PS writes a register, the PL drives the pin

---

## 1. Hardware Platform

| Item | Description |
| --- | --- |
| Board | EBAZ4205 (originally a Bitcoin miner control board) |
| Device | **XC7Z010-1CLG400I** (PS: dual-core Cortex-A9 + PL: Artix-7) |
| Memory | 256 MB DDR3 (16-bit) |
| Controlled device | On-board **red LED** → FPGA pin **W14** (LVCMOS33) |
| Serial port | PS **UART1 → MIO 24/25**, `115200 8N1` |
| PL clock | PS `FCLK_CLK0` = **50 MHz** |
| PL reset | PS `FCLK_RESET0_N` (active low) |

---

## 2. Commands

Connect at 115200 8N1 and the prompt `letter:/$` should appear.

| Command | Effect |
| --- | --- |
| `led 0` | Off |
| `led 1` | Blink, **1-second period** (1.0 Hz — 0.5 s on / 0.5 s off) |
| `led 2` | Blink, **2-second period** (0.5 Hz — 1.0 s on / 1.0 s off) |
| `led 3` | Steady on, **brightness level 1** (~33 % duty) |
| `led 4` | Steady on, **brightness level 2** (~67 % duty) |
| `led 5` | Steady on, **brightness level 3** (100 % duty, brightest) |
| `help` | List all registered commands |
| `Tab` | Command auto-completion |

> A space is required between the command name and its argument, and command
> names are **case-sensitive**.

---

## 3. Directory Structure

```text
.
├── Training/                      Standardized training projects
│   ├── 17L-PKX/
│   │   └── LabTrain/
│   │       └── test/              Zynq LED + letter-shell project
│   ├── Qwerty114514217/
│   │   ├── project_4/
│   │   ├── project_6/
│   │   ├── project_6.xpr
│   │   └── IP.7z
│   ├── wyh/
│   │   └── led_shell/
│   └── docs/                      Shared training documentation
│       ├── FormattExample.pdf
│       ├── OpenColink-horizontal.png
│       ├── traindoc.docx
│       └── 购买参考/
├── RaspberryPi/                   Raspberry Pi projects
│   ├── 17L-PKX/
│   │   └── RaspberryPi_example/
│   └── huanhun213/
│       └── 基于树莓派的拼图程序.py
├── STM32/                         STM32 projects
│   └── billion605/
│       └── JL-0100/
├── C++/                           C++ projects
│   └── ZardFan334/
│       └── 2work.cpp
├── Python/                        Python projects
│   └── 114514gyh1111/
│       ├── 九九乘法倒叙版.py
│       └── 会员充值系统.py
├── dsh-agent/
│   └── Zard-Fan2/
└── .gitignore
```

**Projects are grouped by technology (`Training/`, `RaspberryPi/`, `STM32/`, `C++/`, `Python/`),
and inside each group by contributor name.** The shared training documentation lives in
`Training/docs/` and is not attributed to any single contributor.

---

## 4. System Architecture

```text
  PC serial terminal (SecureCRT / PuTTY, 115200 8N1)
        |  typed:  l e d   3  <Enter>
        v
+------------------------ PS (ARM Cortex-A9) ------------------------+
|  UART1 (MIO24/25)                                                  |
|      ^v  shellRead() / shellWrite()      <- implemented in helloworld.c
|  letter-shell 3.2.4                                                |
|      shellTask -> tokenise -> look up -> call the command function |
|      command table comes from the shellCommand section             |
|      <- lscript.ld provides the start/end symbols                  |
|      |                                                             |
|  funcLed()  ->  write 3 to 0x41200000                              |
+----------------------------|---------------------------------------+
                             | AXI (M_AXI_GP0 -> Interconnect -> AXI GPIO)
+----------------------------v---------------------------------------+
|  PL (FPGA)                                                         |
|  AXI GPIO (0x41200000)  ->  ctrl[31:0]                             |
|  led_ctl.v              ->  PWM / blink from ctrl[2:0] -> led_red  |
+----------------------------|---------------------------------------+
                             | pin W14 (constrained by led_ctl.xdc)
                             v
                        On-board red LED
```

---

## 5. Control Word

AXI GPIO base address **`0x41200000`**, 32-bit, all outputs.
`ctrl[2:0]` selects the function:

| `ctrl[2:0]` | Function | Notes |
| --- | --- | --- |
| `0` | Off | Output held at 0 |
| `1` | Blink, 1-second period | Exact divider: half period 25,000,000 @50 MHz |
| `2` | Blink, 2-second period | Half period 50,000,000 @50 MHz |
| `3` | Brightness level 1 | PWM duty ~33 % (16666 / 50000) |
| `4` | Brightness level 2 | PWM duty ~67 % (33332 / 50000) |
| `5` | Brightness level 3 | PWM duty 100 % |
| `6`, `7` | Reserved | Treated as "off" |

`ctrl[31:3]` is unused.

**PWM settings**: 1 kHz (invisible to the eye), period = 50,000 clock cycles.

---

## 6. Block Design

`design01.bd` contains five cells:

| Cell | Purpose |
| --- | --- |
| `processing_system7_0` | Zynq PS (DDR3, UART1, FCLK_CLK0 @50 MHz, M_AXI_GP0) |
| `axi_interconnect_0` | AXI interconnect (includes an AXI3 -> AXI4-Lite protocol converter) |
| `axi_gpio_0` | **AXI-Lite slave**: turns AXI transactions into a single 32-bit output bus |
| `proc_sys_reset_0` | Synchronises the PS reset into the PL clock domain and generates the `aresetn` signals |
| `led_ctl_0` | Custom LED control module (module reference) |

**Key connections:**

```text
FCLK_CLK0          -> interconnect(ACLK/S00_ACLK/M00_ACLK), axi_gpio(s_axi_aclk),
                      proc_sys_reset(slowest_sync_clk), led_ctl(clk), M_AXI_GP0_ACLK
FCLK_RESET0_N      -> proc_sys_reset(ext_reset_in)
proc_sys_reset/interconnect_aresetn -> interconnect(ARESETN)
proc_sys_reset/peripheral_aresetn   -> interconnect(S00/M00_ARESETN),
                                       axi_gpio(s_axi_aresetn), led_ctl(rst_n)
M_AXI_GP0 -> interconnect(S00_AXI) -> M00_AXI -> axi_gpio(S_AXI)
axi_gpio/gpio_io_o[31:0] -> led_ctl(ctrl[31:0])
led_ctl/led_red          -> top-level port led_red
```

---

## 7. Development Environment

| Tool | Version |
| --- | --- |
| Vivado | **2018.3** |
| Xilinx SDK | **2018.3** |
| Target device | `xc7z010clg400-1` |
| letter-shell | 3.2.4 |

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| No output on the serial port | Wrong COM port / baud rate, or the program is not running | Check 115200 8N1 and that the application has been launched |
| `led` reports "command not found" | The `KEEP` in the linker script did not take effect | Check the three lines in `lscript.ld` |
| The command echoes but the LED does nothing | The PL bitstream is not loaded | Run **Program FPGA** first |
| Garbled characters | Baud rate is not 115200 | Correct the terminal settings |
| Double-tapping Tab shows no help | `SHELL_GET_TICK()` is not implemented | Define that macro in `shell_cfg.h` |

---

## 9. References

- letter-shell: <https://github.com/NevermindZZT/letter-shell>
- EBAZ4205 resources: <https://github.com/xjtuecho/EBAZ4205>
- Design documentation: [`docs/traindoc_formatted.pdf`](docs/traindoc_formatted.pdf)
- Document formatting example: [`docs/FormattExample.docx`](docs/FormattExample.docx)
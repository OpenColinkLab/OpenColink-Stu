# Led_Shell - PS + PL LED Driver with a Serial Shell

Second implementation of the LabTrain LED task (PG002, section 1.2). The other
implementation in this repository is `LabTrain/test` (letter-shell based); this
one uses a small hand-written command parser on the PS and a state machine on
the PL, so the two can be compared side by side.

- **PS side** - UART1 (MIO24/25, 115200 8N1) runs a small hand-written command
  line; it parses the command and writes the mode number into an AXI GPIO.
- **PL side** - the `Led_Driver` state machine with 1 kHz PWM drives the
  on-board red LED (FPGA pin W14).
- **PS to PL path** - PS `M_AXI_GP0` -> AXI Interconnect -> AXI GPIO (AXI-Lite
  slave) -> `ctrl[3:0]` -> `Led_Driver`.

The prerequisite task (PG002, section 1.1), the "Hello World" output, is
included too: it is printed once at start-up and can be repeated with the
`hello` command, so both tasks share one bitstream and one ELF file.

---

## 1. Hardware and Tools

| Item | Description |
| --- | --- |
| Board | EBAZ4205 (Zynq XC7Z010-1CLG400I) |
| Controlled device | On-board red LED, FPGA pin **W14**, LVCMOS33, **active low** |
| Serial port | PS UART1 to MIO24/MIO25, 115200 8N1 |
| PL clock | PS `FCLK_CLK0` = 50 MHz (the board has no PL-side oscillator) |
| PL reset | PS `FCLK_RESET0_N` -> proc_sys_reset -> `pl_rst_n` (active low) |
| Download cable | FT232H (JTAG) |
| Tools | Vivado 2018.3 + Xilinx SDK 2018.3 |

---

## 2. Commands

Connect at 115200 8N1, press Enter and the `led>` prompt appears. Supported
commands:

| Command | Action |
| --- | --- |
| `help` | List all commands |
| `hello` | Print "Hello World" (prerequisite task) |
| `led 0` | Off |
| `led 1` | Blink, 1 s period (0.5 s on / 0.5 s off) |
| `led 2` | Blink, 2 s period (1 s on / 1 s off) |
| `led 3` | PWM steady on, brightness level 1 (about 33 %) |
| `led 4` | PWM steady on, brightness level 2 (about 67 %) |
| `led 5` | PWM steady on, brightness level 3 (100 %) |
| `status` | Show the current LED mode |

A space is required between the command and its argument (`led 3`), and command
names are case-sensitive.

---

## 3. Directory Layout

```text
LabTrain/led_shell/
|-- src/                       RTL and constraints
|   |-- led_driver.v           PL: 6-state FSM + 1 kHz PWM + blink
|   |-- led_shell_top.v        Top level: block design (PS) + Led_Driver
|   `-- led_shell.xdc          Pin constraint (W14)
|-- tb/                        Self-checking testbench
|   `-- tb_led_driver.v        Checks all 6 modes, blink half period and PWM duty
|-- scripts/
|   |-- build_project.tcl      Rebuild Vivado project + bitstream/HDF
|   |-- ps7_cfg.tcl            PS7 configuration (DDR3 / UART1 / FCLK / M_AXI)
|   |-- build_sdk.tcl          Create hw_platform/BSP and compile the ELF
|   |-- run_sim.cmd            Run the testbench with Vivado Simulator
|   |-- run_app.cmd            One click start: PS init -> program PL -> run app
|   `-- run_app.tcl            XSCT script called by run_app.cmd
|-- docs/
|   |-- design.md              Module description, state diagram, timing, PG001 map
|   |-- sim_result.txt         Recorded simulation result (all checks PASS)
|   `-- debug_log.md           Problems hit while bringing the design up
|-- Led_Shell.xpr              Vivado project
|-- Led_Shell.srcs/            Project sources and block design (led_shell_bd)
|-- Led_Shell.sdk/             SDK project; PS side C sources are in
|                              Led_Shell.sdk/led_shell/src
`-- README.md
```

Generated folders (`*.cache`, `*.runs`, `*.hw`, `*.sim`, `*.ip_user_files`,
BD output products, BSP, `Debug/`, `run/`, `sim_out/`) are created by the
scripts and are ignored by the repository `.gitignore`.

---

## 4. Design

### 4.1 Control Word

The AXI GPIO is configured as a 4-bit all-output port. Its base address comes
from the BSP (`XPAR_AXI_GPIO_0_BASEADDR`, `0x41200000` in the block design).
Writing this register from the PS is the command interface to the PL:

| `ctrl[2:0]` | Function |
| --- | --- |
| 0 | Off |
| 1 | Blink, 1 s period |
| 2 | Blink, 2 s period |
| 3 / 4 / 5 | PWM dimming, brightness level 1 / 2 / 3 |
| 6, 7 | Reserved (treated as off) |

### 4.2 PL State Machine

`led_driver.v` uses six states (`S_OFF / S_BLINK_1S / S_BLINK_2S / S_DIM_1 /
S_DIM_2 / S_FULL`) to implement the three LED actions:

- the control word is registered once (`ctrl_r`) before it is used, so the
  asynchronous PS write cannot cause metastability;
- when the state changes the blink counter is cleared and the phase is set to
  "lit", so every new blink starts with the LED on;
- blink: half period is 25 000 000 clocks (0.5 s) or 50 000 000 clocks (1 s);
- PWM: the counter runs 0 to 49 999 (50 MHz / 50 000 = 1 kHz) and the compare
  value is 16 666 / 33 333 / 50 000, i.e. 33 % / 67 % / 100 %;
- the LED is active low, so the output is inverted (`LED_ACTIVE_LOW` parameter,
  change it for a different board).

### 4.3 PS Side Shell

No third-party shell was ported; a minimal command parser was written instead
(option 3 of task 1.2.1):

- UART is polled, the main loop takes characters without blocking;
- on Enter the line is split by spaces, the first word is looked up in the
  command table and the handler is called;
- the `led` command writes the mode into the AXI GPIO and keeps a copy for
  `status`.

### 4.4 Simulation

`tb/tb_led_driver.v` is a self-checking testbench. It scales `CLK_HZ`/`PWM_HZ`
down (100 Hz / 1 Hz) so that the counters stay small, then checks:

- mode 0 and the reserved modes keep the LED off;
- the blink half period of mode 1 and mode 2 (50 / 100 clocks in the scaled run);
- the PWM duty of mode 3 / 4 / 5 (33 / 66 / 100 clocks per 100-clock window).

The recorded result is in `docs/sim_result.txt` (all checks PASS, and the end
of the log says `SIMULATION PASSED`). Run it with:

```text
scripts\run_sim.cmd
```

---

## 5. Building

> **Important**: the Vivado 2018.3 synthesis sub-process does not support
> non-ASCII paths. Clone or copy this repository to an **ASCII-only path**
> before rebuilding, for example `C:\OpenColink-Stu`.
> Submitting and reading the code are not affected; the scripts recreate every
> generated file from the sources.

### 5.1 Command Line (recommended)

```bat
REM 1) Vivado: create project, synthesize, implement, write bitstream + HDF
vivado -mode batch -source scripts\build_project.tcl

REM 2) SDK: prepare the workspace (hw_platform / BSP) and compile the ELF
xsct scripts\build_sdk.tcl
```

The generated files are copied to `run\`: `Led_Shell_Top.bit`, `led_shell.elf`
and `ps7_init.tcl`.

### 5.2 GUI

1. Open `Led_Shell.xpr` in Vivado, then **Generate Bitstream**;
2. **File -> Export -> Export Hardware** (include bitstream) to get `system.hdf`;
3. Open `Led_Shell.sdk` in SDK, create the BSP and build the `led_shell`
   application (sources are in `Led_Shell.sdk/led_shell/src`).

---

## 6. Running on the Board

Power the board, connect the FT232H and the serial cable, then double-click:

```text
scripts\run_app.cmd
```

When `@@@@ PS_INIT + FPGA + APPLICATION RUNNING` appears, the serial terminal
(115200 8N1) prints Hello World (prerequisite task) and the `led>` prompt.
Type `help`, `hello`, `led 1`, `led 5`, ... to check the LED actions.

> The board has no oscillator on the PL side: the PL clock comes from the PS
> `FCLK_CLK0`, therefore `ps7_init` has to run before the bitstream is loaded.
> "Program Device" in Vivado only configures the PL and the LED will not work.

---

## 7. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `no JTAG targets` | hw_server has not finished enumerating; wait 10 s and run again, or re-plug the FT232H |
| Nothing on the serial port | Check 115200 8N1 and the COM port; make sure RUNNING was printed |
| `led` reports unknown command | A space is required (`led 3`); the command table is in `cmd.c` |
| LED behaviour is inverted | Set `LED_ACTIVE_LOW` to 0 in `led_driver.v` and rebuild the bitstream |
| `elf not found` | Run `xsct scripts\build_sdk.tcl` first |

---

## 8. Notes

- Prerequisite task (PG002 1.1): the Hello World output is provided by
  `helloworld.c`; it is printed at start-up and can be repeated with `hello`,
  so both tasks use the same bitstream and ELF file.
- The PS7, AXI GPIO, AXI Interconnect and proc_sys_reset cells in the block
  design are Vivado IP. `led_driver.v`, `led_shell_top.v`, `led_shell.xdc`,
  the testbench under `tb/` and the C sources under
  `Led_Shell.sdk/led_shell/src` were written for this project.
- The code follows the lab coding style (PG001): file headers, doxygen function
  comments (`@brief / @param / @return`) and variable prefixes
  (`fg_` file-static, `f_` parameter, `tp_` temporary, `ix_` index).
- Compared with the letter-shell implementation in `LabTrain/test`: this one
  uses a 6-state FSM instead of a counter plus multiplexer, a 4-bit control
  word instead of 32-bit, and a hand-written shell instead of a third-party
  library (the "option 3" of task 1.2.1).

---

## 9. Known Limitations and TODO

Known limitations:

- only the red LED (W14) is driven, the green LED (W13) is not used;
- the shell polls UART in the main loop (no interrupt / DMA);
- modes 6 and 7 are reserved, there is no breathing or SOS pattern yet;
- LED polarity assumes the EBAZ4205 board (active low), other boards need
  `LED_ACTIVE_LOW` changed;
- the bitstream is not stored in flash, the board has to be programmed again
  after every power cycle.

TODO:

- add a breathing LED (ctrl=6) and an SOS pattern (ctrl=7), plus testbench
  cases for them;
- replace the polled UART with an interrupt driven one;
- pack FSBL + bitstream + elf into `boot.bin` and write it to flash so the
  design starts automatically.

Problems hit while bringing the design up (Vivado non-ASCII path, SDK project
import, `ps7_init` order, LED polarity, ...) are collected in
`docs/debug_log.md`.

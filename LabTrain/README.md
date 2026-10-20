# LabTrain - Training Task Implementations

This directory holds implementations of the PG002 training task
"simple PS-PL LED driver with shell control".

## Layout

| Path | Description |
| --- | --- |
| `test/` | Existing LED + shell implementation (the PS side uses letter-shell, the PL side is driven by the PS through an AXI GPIO) |
| `led_shell/` | New state-machine implementation: a hand-written command parser on the PS, a 6-state FSM plus 1 kHz PWM on the PL, with testbench, build/run scripts and design docs |

The two implementations are independent and can be read side by side. See
`led_shell/README.md` and `led_shell/docs/design.md` for the details of
`led_shell/`.

## Quick start (led_shell)

> The Vivado 2018.3 synthesis sub-process does not support non-ASCII paths.
> Put the repository under an ASCII-only path before rebuilding.

```bat
REM 1) simulation (self-checking testbench)
cd LabTrain\led_shell
scripts\run_sim.cmd

REM 2) rebuild the Vivado project and generate bit / system.hdf
vivado -mode batch -source scripts\build_project.tcl

REM 3) create the SDK hardware platform / BSP and compile the elf
xsct scripts\build_sdk.tcl

REM 4) run on the board (EBAZ4205 + FT232H, serial 115200 8N1)
scripts\run_app.cmd
```

## Conventions

- Only sources and project files are committed. Generated folders
  (`.runs/`, `.cache/`, `.hw/`, `.sim/`, `.ip_user_files/`, BD output
  products, BSP, `Debug/`, `run/`, `sim_out/`, ...) are not stored in the
  repository; see the `.gitignore` in the repository root.
- `docs/`, `project_4/`, `project_6/`, `RaspberryPi_example/` belong to other
  training content and are not related to this task.

## 状态栏合并 + Breakpoint 状态显示

### 修复要求

#### 1. 状态显示规则
- 当断点模式开启时（Click 或 Tool），主状态改为 `Breakpoint`：
  - Click 模式 → `Status: Breakpoint (Click)`
  - Tool 模式 → `Status: Breakpoint (Tool)`
- 当断点模式关闭时，显示原有状态（`Idle`、`Running`、`Paused`、`Waiting`、`Finished`、`Ready`）。

#### 2. 状态优先级
- 断点模式状态**高于**运行状态：
  - 即使程序正在运行，如果断点模式开启，状态栏仍显示 `Status: Breakpoint (Click)` 或 `(Tool)`。
  - 断点模式关闭后，恢复显示实际运行状态。

#### 3. 其他信息不变
- `IP`、`Cell`、`Breakpoints` 数量继续显示在状态栏中。

### 预期效果
- Click 模式开启：`Status: Breakpoint (Click) | IP: 0 | Cell[0] = 0 | Breakpoints: 0`
- Tool 模式开启：`Status: Breakpoint (Tool) | IP: 0 | Cell[0] = 0 | Breakpoints: 0`
- 无断点模式：`Status: Idle | IP: 0 | Cell[0] = 0 | Breakpoints: 0`

### 验收标准
1. Click 模式开启时，状态栏显示 `Breakpoint (Click)`。
2. Tool 模式开启时，状态栏显示 `Breakpoint (Tool)`。
3. 断点模式关闭时，状态栏显示实际运行状态（`Idle`、`Running` 等）。
4. 切换模式时，状态栏同步更新。
5. 其他信息（IP、Cell、Breakpoints）正常显示。
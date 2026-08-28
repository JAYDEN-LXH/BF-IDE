## 性能优化：执行与渲染解耦（Optimal Running）

### 当前问题
- 每执行一步都调用 `updateUI()`（包含 `renderTape()`、`updateStatus()`、`updateHighlight()`），DOM 操作频繁，拖慢执行速度。
- 长程序（>1000 步）运行时，UI 刷新占用了大量主线程时间，导致实际执行速度慢于设置值。

### 解决方案
将“执行”和“UI 刷新”解耦：
- **执行器**（`runStep`）只修改 `bfState` 数据，不触碰 DOM。
- **渲染器**（`renderLoop`）每 200ms 读取 `bfState` 并刷新 DOM。

### 实现要求

#### 1. 修改 `runStep()` 函数
- 移除 `runStep()` 中所有对 `updateUI()`、`renderTape()`、`updateHighlight()` 的调用。
- 执行过程中只修改 `bfState` 中的数据（`tape`、`pointer`、`ip`、`output` 等）。
- 断点检查（`bfState.breakpoints.has`）仍保留，因为需要判断是否暂停。

#### 2. 新增 UI 刷新循环
- 在 `startRun()` 中启动一个 `setInterval`（200ms 间隔），负责刷新 UI。
- 刷新内容：`renderTape()`、`updateStatus()`、`updateHighlight()`。
- 在 `stopRunning()` 中清除 `setInterval`。
- 如果当前处于 `Optimal Running` 模式，才使用这个刷新循环；否则保留原有行为（每步刷新）。

#### 3. 暂停/停止时的 UI 刷新
- 程序暂停或停止时，立即刷新一次 UI（`updateUI()`），确保显示最终状态。

#### 4. 设置面板选项
- 在设置面板中增加复选框：`Optimal Running (faster, fewer updates)`
- 默认：关闭（保留现有行为）
- 开启后：使用 200ms 刷新循环，不再每步刷新 UI

#### 5. 行为说明
- `Optimal Running` 只在 **Run 模式**下生效
- **Step Over 模式**不受影响，仍然每步刷新 UI（因为用户需要看到每一步的变化）
- 开启后，用户仍能看到 Tape 在变化，只是刷新频率从“每步”变为“每 200ms”
- 状态栏（`dbg-status`）在 Optimal Running 模式下仍然更新，只是频率降低

### 验收标准
1. `Optimal Running` 关闭时，行为与现有版本完全一致（每步刷新 UI）。
2. `Optimal Running` 开启时，Run 模式执行速度明显提升，UI 每 200ms 刷新一次。
3. 暂停或停止时，UI 立即刷新，显示最终状态。
4. Step Over 模式下，`Optimal Running` 不影响，仍然每步刷新 UI。
5. 设置面板中的复选框状态保存到 `localStorage`。
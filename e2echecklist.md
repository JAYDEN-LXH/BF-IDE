# BF IDE — 深度 E2E 测试清单（交付前最终版）

## 1. 编辑器 & 高亮 (Editor & Highlight)

- [ y ] 输入所有 BF 指令（`><+-.,[]`），每个字符颜色正确（深色/浅色主题下分别验证）
- [ y ] 输入注释（非 BF 指令字符），注释颜色正确，且样式为 `italic`
- [ y ] 输入中文/日文/韩文字符，不报错，显示为注释样式
- [ y ] 输入大量代码（>1000 行），编辑器不卡顿，高亮正常
- [ ] 输入代码并滚动，高亮层与输入层同步滚动，不错位
- [ ] 调整窗口大小，编辑器自适应，滚动同步依然正常
- [ ] 切换深色/浅色主题，高亮颜色即时切换，无残留

## 2. 调试器 & 执行 (Debugger & Execution)

- [ ] **Run (F5)**：全速运行，Tape 实时更新，IP 推进，状态显示 `Running`
- [ ] **Step Over (F10)**：单步执行，Tape 更新，IP 推进，状态显示 `Paused`
- [ ] **Step Back (F9)**：回退一步，Tape、IP、Output 恢复上一步状态，状态显示 `Paused`
- [ ] **Reset**：重置所有状态（Tape = [0], IP = 0, Output = ''），会话保持，状态显示 `Ready`
- [ ] **Done**：结束会话，代码区恢复可编辑，状态显示 `Idle`，断点清空
- [ ] **Run + Pause**：Run 运行中点击 Run，暂停运行，状态显示 `Paused`；再次点击 Run，继续运行
- [ ] **程序结束**：执行到代码末尾，状态显示 `Finished`
- [ ] **Tape 限制**：程序 `>` 超过 10,000 个 cell，自动停止，状态栏显示错误信息
- [ ] **Output 限制**：程序 `.` 超过 10,000 字符，自动停止，状态栏显示错误信息

## 3. 断点系统 (Breakpoints)

- [ ] **BP Click Mode**：点击代码字符，断点出现（红色高亮），再次点击移除
- [ ] **BP Tool Mode**：打开工具面板，`←`/`→` 移动预断点，编辑器同步高亮
- [ ] **BP Tool Mode**：点击 `Confirm`，预断点位置变为真实断点（红色高亮）
- [ ] **BP Tool Mode**：`快退`/`快进` 移动预断点，每次移动 5 个指令
- [ ] **BP Tool Mode**：`Skip comments` 开启时，预断点跳过注释，只停在 BF 指令上
- [ ] **BP Tool Mode**：`Skip comments` 关闭时，预断点可停在任意字符上
- [ ] **BP Tool Mode**：点击编辑器空白区域，自动退出工具模式，面板隐藏
- [ ] **BP Tool Mode**：点击 `Close` 按钮，退出工具模式，面板隐藏
- [ ] **Run + 断点**：运行到断点处自动暂停，状态显示 `Paused`
- [ ] **Step Over + 断点**：Step Over 忽略断点，正常执行
- [ ] **Clear All Breakpoints**：清除所有断点，高亮消失
- [ ] **模式互斥**：开启 Click Mode 自动关闭 Tool Mode；开启 Tool Mode 自动关闭 Click Mode

## 4. 终端输入 (`,`指令)

- [ ] 程序遇到 `,`，输入框启用，Send 按钮显示
- [ ] 输入字符，按 **Enter** 提交，程序继续执行
- [ ] 输入字符，点击 **Send** 按钮提交，程序继续执行
- [ ] **Pause on input** 勾选时，遇到 `,` 暂停，输入后停在原处
- [ ] **Pause on input** 取消勾选时，遇到 `,` 自动写入 `0`，不暂停，继续执行
- [ ] **Run + `,`**：Run 触发 `,`，输入完成后自动继续运行
- [ ] **Step + `,`**：Step 触发 `,`，输入完成后停在原处（不自动继续）
- [ ] 输入框只允许输入 1 个字符（`maxlength="1"` 生效）
- [ ] 粘贴多个字符到输入框，只保留第一个字符

## 5. 状态栏 & 指示器 (Status Bar)

- [ ] 状态显示正确：`Idle` / `Ready` / `Running` / `Paused` / `Waiting` / `Finished`
- [ ] 无断点模式时，状态栏不显示模式信息
- [ ] Click Mode 开启时，状态栏显示 `Breakpoint (Click)`
- [ ] Tool Mode 开启时，状态栏显示 `Breakpoint (Tool)`
- [ ] IP 正确显示当前指令位置
- [ ] Cell 正确显示当前指针位置的值
- [ ] Cell 值在 32-126 之间时，显示对应的 ASCII 字符（如 `Cell[5] = 72 ('H')`）
- [ ] Breakpoints 数量正确显示

## 6. 工具栏 & 菜单 (Toolbar & Menus)

- [ ] **Start Over**：清空代码、重置状态、结束会话，状态显示 `Idle`
- [ ] **Load file**：加载 `.bf` / `.txt` 文件，保留注释和结构，高亮正常
- [ ] **Load "Hello, World!"**：加载示例代码，清空并重置调试器
- [ ] **Breakpoint mode (Ctrl+B)**：切换 Click Mode，菜单中显示状态
- [ ] **Clear all breakpoints (Ctrl+Alt+B)**：清除所有断点
- [ ] **Open settings (Ctrl+,)**：打开设置面板，所有控件显示当前配置
- [ ] **Open help (F1)**：打开帮助面板，显示快捷键和 BF 指令说明
- [ ] **Escape**：关闭覆盖层 / 设置面板 / 帮助面板
- [ ] 点击覆盖层外部，覆盖层自动关闭
- [ ] 点击覆盖层内菜单项，执行操作后覆盖层自动关闭

## 7. 设置面板 (Settings)

- [ ] **Font**：切换字体，编辑器/高亮层/调试器同步更新
- [ ] **Font size**：调整字号，滑块和数字输入框双向同步，编辑器/高亮层/背景同步更新
- [ ] **Show Animated Background**：取消勾选，背景打字机停止并隐藏；勾选，恢复显示
- [ ] **Pause on input**：勾选/取消勾选，`,` 指令行为变化（见 4.4 / 4.5）
- [ ] **Skip comments**：勾选/取消勾选，工具模式移动行为变化（见 3.5 / 3.6）
- [ ] **Theme Preferences**：点击 `Save Theme Preferences`，当前配置保存到 localStorage
- [ ] **Theme Preferences**：点击 `Clear Theme Preferences`，清除保存配置，恢复默认
- [ ] **Theme Preferences**：状态指示器显示 `Theme saved` / `Default theme`
- [ ] **Run Speed**：调整运行速度（8-1000ms），滑块和数字输入框双向同步，运行中修改立即生效
- [ ] **Custom Code Coloring**：点击 Dark / Light 标签页，分别配置深浅主题颜色
- [ ] **Custom Code Coloring**：修改颜色/样式，保存后编辑器高亮同步更新
- [ ] **Restore Defaults**：点击，所有设置恢复出厂默认，设置面板保持打开，控件同步更新
- [ ] **Cancel**：点击，放弃本次修改，恢复到打开设置面板前的状态
- [ ] **Save**：点击，保存当前配置到 `bfState.config` 和 localStorage，面板关闭
- [ ] **Escape**：关闭设置面板，等同于 `Cancel`（放弃修改）
- [ ] 点击模态框外部，关闭设置面板，等同于 `Cancel`

## 8. 快捷键 (Keyboard Shortcuts)

- [ ] `F1` — 打开帮助
- [ ] `F5` — 运行 / 暂停运行
- [ ] `F10` — 单步执行
- [ ] `F9` — 回退一步
- [ ] `Ctrl+Alt+R` — Reset
- [ ] `Ctrl+Alt+D` — Done
- [ ] `Ctrl+Alt+N` — Start Over
- [ ] `Ctrl+O` — Load file
- [ ] `Ctrl+Alt+H` — Load Hello World
- [ ] `Ctrl+B` — Breakpoint mode (Click Mode)
- [ ] `Ctrl+Alt+B` — Clear all breakpoints
- [ ] `Ctrl+,` — Open settings
- [ ] `Ctrl+Alt+T` — Tool Mode
- [ ] `Escape` — 关闭覆盖层 / 设置 / 帮助
- [ ] 快捷键在模态框打开时正常工作（F1 / Escape 优先）
- [ ] 快捷键在终端输入框等待输入时被拦截（不干扰输入）

## 9. 手机适配 (Mobile)

- [ ] 屏幕宽度 ≤ 768px，编辑器和调试区上下排列
- [ ] 屏幕宽度 ≤ 768px，顶部标题简化为 `BF`，按钮尺寸 ≥ 44px
- [ ] 屏幕宽度 ≤ 768px，键盘弹起时调试器压缩为状态栏，编辑器占满空间
- [ ] 屏幕宽度 ≤ 768px，Tape Cell 清晰可读，指针高亮醒目
- [ ] 屏幕宽度 ≤ 768px，Output 最大高度 20vh，Send 按钮 ≥ 44px
- [ ] 屏幕宽度 ≤ 768px，设置面板全屏显示，所有控件可用

## 10. 文件加载 (File Load)

- [ ] 加载 `.bf` 文件，内容完整显示，注释保留
- [ ] 加载 `.txt` 文件，内容完整显示，注释保留
- [ ] 加载文件后，断点被清除，状态重置为 `Ready`
- [ ] 加载文件后，高亮正常，编辑器可编辑
- [ ] 加载空文件，不报错，编辑器清空

## 11. 跨文件/状态交互 (Cross-file / State)

- [ ] Start Over → 加载 Hello World → Run → Done → 加载新文件 → 状态正常
- [ ] 加载文件 → 设置断点 → Run → 暂停 → Step Back → 状态正常
- [ ] 加载文件 → 设置断点 → Done → 断点清除，编辑器可编辑
- [ ] 深色主题下自定义颜色 → 切换浅色主题 → 浅色主题自定义颜色独立保存

## 12. 背景打字机 (Background Typewriter)

- [ ] 页面加载后，背景打字机自动启动
- [ ] `Show Animated Background` 取消勾选，背景打字机停止并隐藏
- [ ] `Show Animated Background` 勾选，背景打字机恢复显示
- [ ] 背景打字机字符数稳定在 `viewportChars ~ viewportChars × 2` 之间
- [ ] 背景打字机不会无限增长内存（上限 30,000 节点）
- [ ] 背景打字机不影响编辑器交互（点击/输入正常）
- [ ] 深色/浅色主题切换，背景打字机颜色适配

## 13. 性能 (Performance)

- [ ] 输入代码时，编辑器响应流畅，无卡顿
- [ ] Run 运行中，界面不卡死，可随时暂停
- [ ] 长时间运行（>10,000 步），内存占用稳定，不泄漏
- [ ] 频繁切换深色/浅色主题，无闪烁，无性能下降
- [ ] 设置面板操作（滑块、颜色选择器）响应及时
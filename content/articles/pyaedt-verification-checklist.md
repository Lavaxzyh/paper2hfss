---
title: PyAEDT 驱动本地仿真的验证清单
description: 一份面向复现任务的最小检查清单：连接、几何、端口、收敛和结果导出缺一不可。
date: 2026-08-01
category: Simulation
tags: PyAEDT, HFSS, Reproducibility
readingTime: 7 min
featured: false
---
这是一篇演示用技术笔记，记录本地 HFSS 自动化最容易被忽略的验证环节。

## 连接不等于可用

成功建立 gRPC 或脚本连接，只说明工具可达。还需要确认活动项目、活动设计、求解设置和拥有的 AEDT 进程都符合预期。

## 复现需要闭环

导出 CSV、场图和报告时，同时保存脚本版本、参数快照、频段和收敛状态，才能让一次仿真变成可审阅的工程记录。

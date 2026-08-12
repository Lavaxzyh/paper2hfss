---
title: 从论文图表提取天线参数
description: 论文中的结构图、尺寸表和曲线往往互相补充，参数提取应当保留来源与不确定性。
date: 2026-08-05
category: Paper2HFSS
tags: Paper Parsing, Antenna, Reproduction
readingTime: 5 min
featured: false
---
这是一篇演示用技术笔记。Paper2HFSS 的第一步不是马上画模型，而是建立一个带来源标记的工程参数表。

## 图像不是参数表

从图中读取的尺寸可能受到线宽、透视、分辨率和单位标注影响。每个参数都应记录原文位置、推断方式与置信度。

## 让缺失信息可见

当介电常数、损耗角正切、边界距离或馈电细节缺失时，系统应明确标记未知，而不是静默填入一个看似合理的默认值。

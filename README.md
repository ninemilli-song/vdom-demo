# 一个用来解释VDOM的Demo

## What's VDOM

首先我们都知道什么是DOM(Document Object Model)，简单说就是将一个HTML文档抽象表达为树结构。VDOM则是将DOM再抽象一层生成的简化版js对象，这个对象也拥有DOM上的一些属性，比如id, class等，但它是完全脱离于浏览器而存在的。

## Why VDOM

### What problem VDOM fixed

Find DOM element and update DOM element that can cause **repaint** and **reflow** those is expensive, so find js Object and alert it is effective way.

### How done it in React

1. Update data by **setState** method

2. Create a new VDOM by data

3. Diff the new VDOM with the old one, create some patches

4. Update those patchs to the real DOM, finish it





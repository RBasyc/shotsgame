/**
 * 输入处理类
 * 处理键盘和鼠标输入
 */

import { InputState } from '../core/Game';

export class InputManager {
  private inputState: InputState;
  private onMouseMove: ((event: MouseEvent) => void) | null = null;
  private pointerLockElement: HTMLElement | null = null;

  constructor() {
    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
    };
  }

  /**
   * 初始化输入监听
   */
  init(element: HTMLElement) {
    this.pointerLockElement = element;

    // 键盘事件
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);

    // 指针锁定事件
    element.addEventListener('click', this.requestPointerLock);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    // 鼠标移动
    this.onMouseMove = this.handleMouseMove;
    document.addEventListener('mousemove', this.onMouseMove);
  }

  /**
   * 清理输入监听
   */
  cleanup() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);

    if (this.pointerLockElement) {
      this.pointerLockElement.removeEventListener('click', this.requestPointerLock);
    }

    document.removeEventListener('pointerlockchange', this.onPointerLockChange);

    if (this.onMouseMove) {
      document.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  /**
   * 请求指针锁定
   */
  private requestPointerLock = () => {
    if (this.pointerLockElement) {
      this.pointerLockElement.requestPointerLock();
    }
  };

  /**
   * 指针锁定状态变化
   */
  private onPointerLockChange = () => {
    const isLocked = document.pointerLockElement === this.pointerLockElement;
    // 可以在这里暂停游戏或显示菜单
  };

  /**
   * 键盘按下
   */
  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        this.inputState.forward = true;
        break;
      case 'KeyS':
        this.inputState.backward = true;
        break;
      case 'KeyA':
        this.inputState.left = true;
        break;
      case 'KeyD':
        this.inputState.right = true;
        break;
      case 'Space':
        this.inputState.jump = true;
        break;
    }
  };

  /**
   * 键盘抬起
   */
  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        this.inputState.forward = false;
        break;
      case 'KeyS':
        this.inputState.backward = false;
        break;
      case 'KeyA':
        this.inputState.left = false;
        break;
      case 'KeyD':
        this.inputState.right = false;
        break;
      case 'Space':
        this.inputState.jump = false;
        break;
    }
  };

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement !== this.pointerLockElement) {
      return;
    }

    // 这个方法会在 GameCanvas 中被重写
    // 这里只是占位符
  };

  /**
   * 设置鼠标移动回调
   */
  setMouseMoveCallback(callback: (movementX: number, movementY: number) => void) {
    this.onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === this.pointerLockElement) {
        callback(event.movementX, event.movementY);
      }
    };

    // 重新绑定事件
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  /**
   * 获取当前输入状态
   */
  getInputState(): InputState {
    return { ...this.inputState };
  }

  /**
   * 检查是否锁定
   */
  isPointerLocked(): boolean {
    return document.pointerLockElement === this.pointerLockElement;
  }
}

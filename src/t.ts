interface IParent {
  calculate(x: number, y: number): number
}

class Parent implements IParent {
  calculate(x: number, y: number) {
    return x + y
  }
}

class Child extends Parent {
  calculate(x, y) {
    // 自动推断参数和返回类型
    return x * y
  }
}

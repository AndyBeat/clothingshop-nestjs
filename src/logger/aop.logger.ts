import { ConsoleLogger } from '@nestjs/common';

export class AopLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    // 把这个logger加入了app里面,就不打印执行时间了,不知道为什么
    // 我现在知道为什么不打印时间了,是要设置logger参数才可以的,设置{timestamp: true}这个参数即可,因为覆盖了源代码的logger的配置

    // 之前一直打印undefined的原因也找到了,是这个方法的调用问题,之前写的是一直调用的是log的两个参数,导致不传第二个参数也会传一个undefined进去了
    // 所以判断没传第二个参数的时候就调一个参数的log方法即可,目前只能这样解决了
    if (context) {
      // 这个log的调用我懂什么意思了
      // 1.只传message的时候,如果设置了context,那么就用构造里面的context
      // 2.如果传message, context的时候,就会修改context的值,忽略构造里面的context
      // 3.如果传message, ...any, string三个参数的时候,就相当于传入了多个message,就会打印多次,并且以最后一个参数作为context打印输出
      super.log(message, context);
    } else {
      super.log(message);
    }
  }
}

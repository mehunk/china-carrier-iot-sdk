# 中国主流运营商物联网平台接口 SDK

## 功能说明

本 SDK 包含中国移动、联通、电信三大运营商物联网平台的以下接口。

### 移动

- [x] 查询设备状态；
- [x] 查询使用流量；
- [x] 更改设备状态（库存期 -> 已激活）；
- [x] 更改设备状态（已激活 -> 停机）；
- [x] 更改设备状态（停机 -> 已激活）；

### 联通

- [x] 查询设备详情；
- [x] 查询使用流量；
- [x] 更改设备状态；

### 电信

- [x] 查询设备详情；
- [x] 查询使用流量；
- [x] 更改设备状态；

## TODO

- [ ] 加入代码风格检测工具和格式化工具；
- [ ] 加入编译命令；

### 移动

- [ ] 处理 Token 异常失效的问题；
- [ ] 单元测试；

### 联通

- [ ] 处理 Token 异常失效的问题；
- [ ] 单元测试；

### 电信

- [ ] 单元测试；
 
#### SOAP

- [ ] 处理文档中可能发生的异常；
- [ ] 处理文档外可能发生的异常；

#### REST

- [ ] 处理 Token 异常失效的问题；
- [ ] 处理文档中可能发生的异常；
- [ ] 处理文档外可能发生的异常；

## 开发

### 准备

首先全局安装一些项目开发用到的依赖包。

```shell script
$ npm i -g lerna typescript ts-node
```

在项目根目录下安装依赖包，在每个 `package` 下面也同样安装对应的依赖。

```shell script
$ yarn
$ lerna bootstrap
```

### 编译

进入到 `package/` 下要编译的目录，运行以下命令即可编译成功。

```shell script
$ rm -rf lib # 手动删除之前编译的包
$ tsc
```

### 代码格式化

在项目根目录下执行以下命令。

```shell script
$ yarn lint
$ yarn prettier
```

## 发布

### 发布前准备

需要先根据本次发布的功能修改一下本次发布的版本号。

```shell script
$ npm version <update_type>
```

### 发布

进入到 `package/` 下要发布的包目录，运行以下命令。

```shell script
$ npm publish
```
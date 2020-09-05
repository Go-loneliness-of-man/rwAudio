# rwAudio

#### 介绍
基于 vue2.5+ 的音乐播放器组件，支持拖动等操作，仅支持 PC 端，效果如下：

[视频](./1599328363485.mp4)

#### 接口
开发时调用了第三方开源接口，套用了其响应的数据格式，仓库地址：https://github.com/JxiaoC/animeMusic

#### 注意
1、服务端需支持 http range，否则会有拖动进度条无效的问题，即 response header 必须包含 Content-Length、Content-Range、Accept-Ranges、Content-Type 四个字段，如：

Accept-Ranges: bytes
Content-Length: 2364787
Content-Range: bytes 1474560-3839347/3839347
Content-Type: audio/mpeg

2、有两个依赖路径不对，原因是我是在一个完整的项目中开发该组件的，现在单独摘出来便缺了一些文件，具体是 importScss.scss、base.vue 这俩，我把它俩放到根目录了，但引用路径我就不改了，大家根据自己的需要改改

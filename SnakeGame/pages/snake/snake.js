// pages/snake/snake.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score:0,            //当前分数
    maxscore:0,       //最高分数
    startX:0,           //触摸开始的横坐标
    startY:0,           //触摸开始的纵坐标
    endX:0,             //触摸结束的横坐标
    endY:0,             //触摸结束的纵坐标
    ground:[],          //存储操场的每个方块
    rows:28,            //行数
    cols:22,            //列数
    snake:[],           //蛇
    food:[],            //食物
    direction:"right",  //移动方向
    timer:"",           //初始化定时器
    modalHidden:true,   //modal标签是否隐藏

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("start")
    var maxscore=wx.getStorageSync('maxscore')      //获取缓存的历史最高分
    if(!maxscore){                                  //若maxscore没有值，进入并初始化为0，若有值，则跳过
      maxscore=0
    }
    this.initGround(this.data.rows,this.data.cols)
    this.initSnake(3)
    this.initFood()
    this.move()
  },
  //计分器
  storeScore:function(){
    if(this.data.score>this.data.maxscore){       
      this.setData({
        maxscore:this.data.score
      })
      wx.setStorageSync('maxscore', this.data.maxscore) //同步请求缓存数据，记录历史最高分
    }
  },
  //初始化操场
  initGround:function(rows,cols){
    for(var i=0;i<rows;i++){
      var arr=[]
      // console.log(arr)
      this.data.ground.push(arr)
      for(var j=0;j<cols;j++){
        this.data.ground[i].push(0)
      }
    }
  },
  //初始化蛇，蛇的长度是3，宽度是1
  initSnake: function(len){
    for(var i=0;i<len;i++){
      this.data.ground[0][i]=1    //蛇的位置标记为1
      this.data.snake.push([0,i]) //将坐标值赋值给蛇的二维数组，将蛇的身体所占的位置标记上去
    }
  },
  //初始化食物
  initFood: function(){
    //以下部分是老师所写，但是有一个bug，如果食物所产生的坐标与蛇重合，那么再次调用initfood函数后，先前存入ground数组的数据并没有清空，这导致生成了两个甚至多个food坐标
    /*
    var x=Math.floor(Math.random()*this.data.rows) //随机生成食物横坐标，范围为[0,rows-1]
    var y=Math.floor(Math.random()*this.data.cols) //随机生成食物纵坐标，范围为[0,cols-1]
    x=0
    var ground=this.data.ground                    //定义操场数组的变量
    var snake=this.data.snake                      //定义蛇数组的变量
    console.log(x,y)
    for(var i=0;i<snake.length;i++){
      var node=snake[i][1]        //获取蛇数组中二维数组的第二个值，例如snake=[[0,1],[0,2],[0,3]]，则循环获取1、2、3
      if(x==0&&y==node){          //如果食物的坐标与蛇的坐标重合，则重新初始化食物坐标，若没有重合，则赋值给data即可
        this.initFood()           //重新初始化食物坐标
        // return
      }else{                      //没有重合的情况，则赋值
        console.log("进入最终一步：" + x,y)
        ground[x][y]=2            //食物的位置标记为2
        this.setData({
          ground: ground,
          food: [x,y]
        })
      }
    }
    */

    //进入循环，随机生成x和y，然后进入二级循环比对，若没有问题，则赋值并且跳出此循环
    while(1){                                
      var x=Math.floor(Math.random()*this.data.rows) //随机生成食物横坐标，范围为[0,rows-1]
      var y=Math.floor(Math.random()*this.data.cols) //随机生成食物纵坐标，范围为[0,cols-1]
      var ground=this.data.ground                    //定义操场数组的变量
      var snake=this.data.snake                      //定义蛇数组的变量
      var flag=true
      // x=0                                         //test：仅用于测试坐标重复的情况
      // console.log(x,y)                            //test：打印x和y的值 
      for(var i=0;i<snake.length;i++){
        var node=snake[i][1]      //获取蛇数组中二维数组的第二个值，例如snake=[[0,1],[0,2],[0,3]]，则循环获取1、2、3
        if(x==0&&y==node){        //如果食物的坐标与蛇的坐标重合，则置为false，下面会再次进入生成x和y
          flag = false
          break
        }
      }
      if(flag){                   //若flag为true，则是没有重合的情况，则进入赋值阶段，若为false，则跳过，继续生成x和y
        ground[x][y]=2            //食物的位置标记为2
        this.setData({
          ground: ground,
          food: [x,y]
        })
        break                     //食物坐标已经生成，跳出循环
      }
    }
  },
  //手指触摸的开始事件
  tapStart: function(event) {
    // console.log("鼠标开始点击")
    //将点击的坐标赋值给startX和startY
    this.setData({
      startX:event.touches[0].pageX,
      startY:event.touches[0].pageY
    })
  },
  //手指触摸移动
  tapMove: function tapMove(event) {
    // console.log("开始点击")
    this.setData({
      endX:event.touches[0].pageX,
      endY:event.touches[0].pageY
    })
  },
  //手指触摸结束
  tapEnd: function(event) {
    var diffX=(this.data.endX)?(this.data.endX-this.data.startX):0  //获取滑动的横坐标距离之差
    var diffY=(this.data.endY)?(this.data.endY-this.data.startY):0  //获取滑动的纵坐标距离之差
    // if(Math.abs(diffX)-Math.abs(diffY)>0&&diffX>0){         //向右移动
    //   console.log("向右移动")
    // }else if(Math.abs(diffX)-Math.abs(diffY)>0&&diffX<0){   //向左移动
    //   console.log("向左移动")
    // }else if(Math.abs(diffX)-Math.abs(diffY)<0&&diffY>0){   //向下移动
    //   console.log("向下移动")
    // }else if(Math.abs(diffX)-Math.abs(diffY)<0&&diffY<0){   //向上移动
    //   console.log("向上移动")
    // }
    if(Math.abs(diffX)>5||Math.abs(diffY)>5){
      var direction=this.computerDir(diffX,diffY) //获取小蛇移动的方向
      // console.log("小蛇移动方向：" + direction)
      switch(direction){                          //该语句块是为了屏蔽掉正处于向某一方向移动时，下达了其相反指令的操作 
        case "left":                              //小蛇向左移动时，屏蔽下达的向右移动的指令
          if(this.data.direction=="right"){       
            return
          }
        break
        case "right":                             //小蛇向右移动时，屏蔽下达的向左移动的指令
          if(this.data.direction=="left"){
            return
          }
        break
        case "top":                               //小蛇向上移动时，屏蔽下达的向下移动的指令
          if(this.data.direction=="bottom"){
            return
          }
        break
        case "bottom":                            //小蛇向下移动时，屏蔽下达的向上移动的指令
          if(this.data.direction=="top"){
            return
          }
        break
      }
      this.setData({
        direction:direction,          //若指令下达正确，则往Data中的方向赋值             
        // startX:0,                     //tapStart与tapEnd中已经赋值，这里需要判断是否有必要在这里初始化??
        // startY:0,
        // endX:0,
        // endY:0
      })
      // console.log(this.data.direction)
    }
  },
  //判断滑动方向
  computerDir: function(p_diffX,p_diffY){     //p_diffX：横坐标差值，p_diffY：纵坐标差值
    if(Math.abs(p_diffX)>Math.abs(p_diffY)){  //若横坐标差值大于纵坐标差值，则滑动方向为“左”或者“右”
      return (p_diffX>0)?"right":"left"       //若横坐标差值为正数，则为“右”，反之为“左”
    }else{
      return (p_diffY>0)?"bottom":"top"       //若纵坐标差值为正数，则为“下”，反之为“上”
    }
  },
  //移动函数
  move: function(){
    var that=this                                 //由于this作用域问题，这里定义一个that
    this.data.timer=setInterval(function(){       //开启定时器
      // console.log(that.data.direction)
      that.changeDirection(that.data.direction)   //让小蛇根据direction方向来移动
      // that.setData({
      //   ground:that.data.ground                   //由于小蛇移动后ground值变更，这里重新赋值？？
      // })
    },250)
    // console.log("test")
  },
  //改变方向
  changeDirection: function(dir){
    var snake=this.data.snake           //获取蛇的数组
    var length=snake.length             //获取数组长度
    var snakeTail=snake[0]              //获取小蛇移动前的尾部坐标，给checkGame中调用
    var ground=this.data.ground         //获取操场
    ground[snakeTail[0]][snakeTail[1]]=0//蛇尾坐标赋值为0
    for(var i=0;i<length-1;i++){        //循环执行长度-1次即可
      snake[i]=snake[i+1]               //蛇数组的值向前前进一位
    }
    var x,y                             //定义蛇头的横纵坐标变量
    if(dir=="left"){
      x=snake[length-1][0]              //获取蛇头的横坐标
      y=snake[length-1][1]-1            //获取蛇头的纵坐标，-1是由于小蛇向左移动了
    }else if(dir=="right"){
      x=snake[length-1][0]              //获取蛇头的横坐标
      y=snake[length-1][1]+1            //获取蛇头的纵坐标，+1是由于小蛇向右移动了
    }else if(dir=="top"){
      x=snake[length-1][0]-1            //获取蛇头的横坐标，-1是由于小蛇向上移动了
      y=snake[length-1][1]              //获取蛇头的纵坐标
    }else if(dir=="bottom"){
      x=snake[length-1][0]+1            //获取蛇头的横坐标，+1是由于小蛇向上移动了
      y=snake[length-1][1]              //获取蛇头的纵坐标
    }
    
    snake[length-1]=[x,y]               //将向左移动后的蛇头坐标值加入蛇数组中
    this.checkGame(snakeTail)           //若吃到食物，则将通过前进一位得出来空的蛇尾添加进蛇数组中，也就是增加了蛇的长度
    for(var i=1;i<length;i++){
      ground[snake[i][0]][snake[i][1]]=1//将小蛇数组中的坐标在ground数组中都标记为1，表示为小蛇的身体
    }
    this.setData({
      ground:ground,
      snake:snake
    })
    return true
  },
  //游戏状态
  checkGame: function(snakeTail){
    var snake=this.data.snake           //获取蛇的数组
    var length=snake.length             //获取数组长度
    var snakeHead=snake[length-1]       //获取蛇头的坐标值，snake是二维数组[[0,0][0,1][0,2]]，snakehead为一维数组，例如[0,2]
    //如果蛇头坐标超出了ground范围，则关闭计时器，即停止小蛇移动，snakeHead[0]:蛇头的横坐标，snakeHead[1]:蛇头的纵坐标
    if(snakeHead[0]<0||snakeHead[0]>=this.data.rows||snakeHead[1]<0||snakeHead[1]>=this.data.cols){
      clearInterval(this.data.timer)    //关闭计时器
      this.setData({                
        modalHidden:false               //打开弹窗
      })
    }
    for(var i=0;i<length-1;i++){        //使用length-1是因为去掉了蛇头的值
      //如果蛇头撞蛇身，则关闭计时器，snake[i][0]:蛇的横坐标，snake[i][1]:蛇的纵坐标
      if(snakeHead[0]==snake[i][0]&&snakeHead[1]==snake[i][1]){
        clearInterval(this.data.timer)  //关闭计时器
        this.setData({
          modalHidden:false             //打开弹窗
        })
      }
    }
    //若蛇头横坐标及纵坐标与食物相同，则判定为吃到食物
    if(snakeHead[0]==this.data.food[0]&&snakeHead[1]==this.data.food[1]){
      snake.unshift(snakeTail)        //增加蛇的长度，增加在蛇尾的位置
      this.setData({
        score:this.data.score+10      //当前分数加10分
      })
      this.initFood()                 //重新初始化食物，生成食物的位置
      this.storeScore()               //本地缓存，记录历史最高分
    }
  },
  //弹出框中点击确定触发的事件
  modalConfirm:function(){
    this.setData({
      score:0,
      ground:[],
      snake:[],
      food:[],
      modalHidden:true,
      direction:"right"
    })
    this.onLoad()
  }

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面隐藏
  //  */
  // onHide: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面卸载
  //  */
  // onUnload: function () {

  // },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }
})
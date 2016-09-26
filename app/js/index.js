/**
 * Created by root on 21/09/16.
 */

var Drive=function(stage, loader, color, name){
  this.x = 0;
  this.y = 0;
  this.i = 0;
  this.k = 0.57;
  this.speed = 3;
  this.distance = 0;
  this.step = 0;
  this.stage = stage;
  this.loader = loader;
  this.color = color;
  this.name = name;
  this.line = new createjs.Graphics().setStrokeStyle(8, 'square');
  this.sLine = new createjs.Shape(this.line);
};

Drive.prototype = {
  constructor: Drive,

  initAniFrame: function() {
    var arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      arr2 = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    this.aniTruck1 = this.createTrucksAnimation('trucks1', arr1, arr2, 0, 12);
    this.aniTruck1Ct = this.createTrucksAnimation('trucks1', arr1, arr2, 0, 12);

    this.aniTruck2 = this.createTrucksAnimation('trucks2', arr1, [], 0, 12);
    this.aniTruck2Ct = this.createTrucksAnimation('trucks2', arr1, [], 0, 12);

    this.aniTruck3 = this.createTrucksAnimation('trucks3', arr2, arr1, 12, 0);
    this.aniTruck3Ct = this.createTrucksAnimation('trucks3', arr2, arr1, 12, 0);

    this.aniTruck4 = this.createTrucksAnimation('trucks4', [], [], 0, 1);
    this.aniTruck4Ct = this.createTrucksAnimation('trucks4', [], [], 0, 1);
    this.initTrucksAni();
  },

  initTrucksAni: function() {
    this.aniTruck1.gotoAndPlay('full');
    this.aniTruck1Ct.gotoAndPlay('empty');

    this.aniTruck2.gotoAndPlay('empty');
    this.aniTruck2Ct.gotoAndPlay('empty');

    this.aniTruck3.gotoAndPlay('empty');
    this.aniTruck3Ct.gotoAndPlay('full');

    this.aniTruck4.gotoAndPlay('full');
    this.aniTruck4Ct.gotoAndPlay('full');
  },

  drive: function(truck, startX, startY, bound, direction) {
    var self = this,
      nextX = startX + self.i,
      nextY,
      truckIndex,
      truckOffsetX = 0,
      truckOffsetY = 0;

    switch (direction) {
      case 'leftTop':
        nextY =  startY + self.i * self.k;
        self.absIndex = - self.i;
        break;
      case 'rightTop':
        nextY = startY - self.i * self.k;
        self.absIndex = self.i;
        break;
      case 'leftBottom':
        nextY = startY - self.i * self.k;
        self.absIndex = - self.i;
        break;
      case 'rightBottom':
        nextY = startY + self.i * self.k;
        self.absIndex = self.i;
        console.log(self.absIndex);
        break;
    }
    self.distance += Math.abs(self.i);
    if(self.absIndex > bound) {
      self.x = nextX;
      self.y = nextY;
      self.i = 0;
      self.absIndex = 0;
      self.step ++;
      return;
    }
    self.line.beginStroke(self.color).moveTo(startX, startY);

    nextX = startX + self.i;

    switch (direction) {
      case 'leftTop':
        self.i = self.i - self.speed;
        nextY = startY + self.i * self.k;
        truckOffsetX = -39;
        truckOffsetY = -35;
        break;
      case 'rightTop':
        self.i = self.i + self.speed;
        nextY =  startY - self.i * self.k;
        truckOffsetX = -10;
        truckOffsetY = -30;
        break;
      case 'leftBottom':
        self.i = self.i - self.speed;
        nextY =  startY - self.i * self.k;
        truckOffsetX = -15;
        truckOffsetY = -35;
        break;
      case 'rightBottom':
        self.i = self.i + self.speed;
        nextY =  startY + self.i * self.k;
        truckOffsetX = -12;
        truckOffsetY = -18;
        break;
    }
    self.line.lineTo(nextX, nextY).endStroke();

    truck.x = nextX + truckOffsetX;
    truck.y = nextY + truckOffsetY;
  },

  createTrucksAnimation: function(truckId, n, out, empty, full) {
    var self = this;
    var spriteSheet = new createjs.SpriteSheet({
      framerate: 12,
      images: [self.loader.getResult(truckId)],
      frames: {
        width: 50,
        height: 42,
        spacing: 30,
      },
      animations: {
        in: { frames: n || [], next: false },
        out: { frames: out || [], next: false },
        empty: { frames: empty || [], next: false },
        full: { frames: full || [], next: false },
        reset: { frames: 0, next: false },
      }
    });
    var prodTruck = new createjs.Sprite(spriteSheet);
    prodTruck.x = -100;
    prodTruck.y = -100;
    self.stage.addChild(prodTruck);

    prodTruck.on("animationend", function(e) {
      if (e.name === 'in' || e.name === 'out') {
        self.step ++;
      }
    });
    return prodTruck;
  },
  getSLine: function() {
    return this.sLine;
  },
  getAniTruck: function(aniTruckId) {
    return this[aniTruckId];
  },
  getStep: function() {
    return this.step;
  },
  setStep: function(step) {
    this.step = step;
  },
  getX: function() {
    return this.x;
  },
  getY: function() {
    return this.y;
  },
  getAbsIndex: function() {
    return this.absIndex;
  },
  getDistance: function() {
    return this.distance === 0 ? 0 : Number((this.distance / 3000).toFixed(2));
  }
};

var CanvasMap=function(){
  this.mapType = 'kz'; // kz 或者 ct
  this.mapEl=$("#js-index-canvas");
  this.mapW=$(window).width();
  this.mapH=746;
  this.alive = true;
  this.gasFp = 0.635; // 每公里油费
  this.staticUrl="/img/";
  this.manifest = [
    {src: "map.png", id: "map"},
    {src: "trucks-1.png", id: "trucks1"},
    {src: "trucks-2.png", id: "trucks2"},
    {src: "trucks-3.png", id: "trucks3"},
    {src: "trucks-4.png", id: "trucks4"},
    {src: "block-1.png", id: "block1"},
    {src: "block-2.png", id: "block2"},
    {src: "block-3.png", id: "block3"},
    {src: "block-4.png", id: "block4"},
    {src: "block-5.png", id: "block5"},
    {src: "block-5-1.png", id: "block5-1"},
    {src: "block-5-2.png", id: "block5-2"},
    {src: "pause.png", id: "pause"},
    {src: "play.png", id: "play"},
    {src: "tab-kz.png", id: "tabkz"},
    {src: "tab-ct.png", id: "tabct"}
  ];
};

CanvasMap.prototype={
  constructor: CanvasMap,

  init:function(){
    var self=this;
    self.mapEl.attr({
      width:self.mapW,
      height:self.mapH
    });
    self.stage = new createjs.Stage("js-index-canvas");
    self.stage.enableMouseOver(10);
    self.loader = new createjs.LoadQueue(false);
    self.loader.addEventListener("complete", function() {
      self.handleAsstesLoad(self);
      self.setTicker(self);
    });
    self.loader.loadManifest(self.manifest, true, self.staticUrl);

  },

  setTicker:function(self){
    //时间间隔
    createjs.Ticker.setInterval(25);
    //设定帧速
    createjs.Ticker.setFPS(30);
    //设定暂停
    createjs.Ticker.setPaused(true);
    //设定定时模式
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", self.onTick.bind(self));
  },

  refresh:function(self, bChange) {
    if (!bChange) {
      self.mapType = self.mapType === 'kz' ? 'ct' : 'kz';
    }
    self.stage.removeAllChildren();
    createjs.Ticker.setPaused(true);
    self.handleAsstesLoad(self);
    if (!self.alive) {
      self.setTicker(self);
      self.alive = true;
    }
    self.stage.update();
  },

  handleAsstesLoad:function(self){
    self.cvsW = self.stage.canvas.width;
    self.cvsH = self.stage.canvas.height;
    self.mapBg = new createjs.Bitmap(self.loader.getResult('map'));
    self.footer = new createjs.Container();

    self.driveKZ = new Drive(self.stage, self.loader, '#fff36d', 'kz');
    self.driveCT = new Drive(self.stage, self.loader, '#fff36d', 'ct');

    self.mapBg.x = (this.cvsW - self.mapBg.image.width * self.mapBg.scaleX) / 2;
    self.mapBg.y = 0;

    var centerPoint = new createjs.Point(this.cvsW / 2, this.cvsH / 2),
      sFooter = new createjs.Shape(),
      gFooter = sFooter.graphics;

    self.cY = centerPoint.y;
    self.cX = centerPoint.x;

    self.playBtn = new createjs.Bitmap(self.loader.getResult('play'));
    self.clonePlayBtn=self.playBtn.clone();
    self.pauseBtn = new createjs.Bitmap(self.loader.getResult('pause'));
    self.tab = new createjs.Bitmap(self.loader.getResult(self.mapType === 'kz' ? 'tabkz' : 'tabct'));
    self.tabCt = new createjs.Bitmap(self.loader.getResult('tabct'));

    self.playBtn.x = self.cX + 360;
    self.playBtn.y = self.tab.y = 20;
    self.playBtn.cursor = 'pointer';

    self.tab.x = self.cX;
    self.tab.cursor = 'pointer';

    gFooter.beginFill('#fff').drawRect(0, 0, self.cvsW, 87);

    self.footer.addChild(sFooter, self.playBtn, self.tab);
    self.footer.x =  0;
    self.footer.y = self.cvsH - 86;

    self.playBtn.addEventListener('click', function(e) {
      self.handlePlayBtnClick(e, self);
    });

    self.tab.addEventListener('click', function(e) {
      self.refresh(self);
    });

    var circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 2);
    circle.x=self.cX;
    circle.y = self.cY;
    self.stage.addChild(self.mapBg,circle, self.footer);

    self.createBlock(self, 'block1', self.cX-370, self.cY-260, self.cX - 226, self.cY - 215, '发货点B旁白换行副反反复复反反复复反反复复分发广告更好的哈哈哈电话订单号的');
    self.createBlock(self, 'block2', self.cX+100, self.cY-360, self.cX + 300,self.cY - 360, '收货点A旁白');
    self.createBlock(self, 'block3', self.cX-254, self.cY+47, self.cX - 100, self.cY + 50, '收货点B旁白');
    self.createBlock(self, 'block4', self.cX+132, self.cY+65, self.cX + 280, self.cY + 50, '发货点A旁白');
    self.block5 = self.createBlock(self, 'block5', self.cX+175, self.cY-125,self.cX + 300, self.cY - 150, '物流公司旁白');

    self.block5Clone = self.block5.clone();
    self.block5Clone.children[0]=self.block5.children[0].clone();

    self.block5_1 = new createjs.Bitmap(self.loader.getResult('block5-1'));
    self.block5_2 = new createjs.Bitmap(self.loader.getResult('block5-2'));

    self.ctSLine = self.driveCT.getSLine();
    self.kzSLine = self.driveKZ.getSLine();

    self.stage.addChild(self.ctSLine);
    self.stage.addChild(self.kzSLine);

    self.driveKZ.initAniFrame();
    self.driveCT.initAniFrame();
  },

  createBlock:function(self, name, x, y, xt, yt, msg){
    var block = new createjs.Bitmap(self.loader.getResult(name));
    var blockContainer = new createjs.Container();
    blockContainer.x = x;
    blockContainer.y = y;
    blockContainer.addEventListener("mouseover", function(event) {
      blockContainer.shadow = new createjs.Shadow("rgba(0,0,0,0.2)", 0, 0, 10);
      self.stage.update();
    });
    block.addEventListener("mouseout", function(e) {
      blockContainer.shadow = null;
      self.stage.update();
    });
    blockContainer.addEventListener('click', function(e) {
      console.info(e, 'block');
      self.createToolTip(self, xt, yt, msg);
    });
    blockContainer.cursor = 'pointer';
    blockContainer.addChild(block);
    self.stage.addChild(blockContainer);
    self.stage.update();
    return blockContainer;
  },

  createReckon: function(m, g) {
    m = Number(m).toFixed(2);
    g = Number(g).toFixed(2);
    $('.js-gas').text(g);
    $('.js-mile').text(m);
  },

  createToolTip:function(self, x, y, msg){
    var sMask = new createjs.Shape(),
      sBox = new createjs.Shape(),
      sArrow = new createjs.Shape(),
      gMask = sMask.graphics,
      gBox = sBox.graphics,
      gArrow = sArrow.graphics,
      toolTipText = new createjs.Text(msg, "12px Arial", '#333');
    //精简代码，是个if语句
    self.toolTip && self.stage.removeChild(self.toolTip);

    self.toolTip = new createjs.Container();

    gMask.beginFill('rgba(0, 0, 0, 0.5)');
    gMask.drawRect(0, 0, self.cvsW, self.cvsH);

    gBox.beginFill('#fff');
    gBox.drawRoundRect(x, y, 300, 160, 10, 10, 10, 10);

    gArrow.beginFill('#fff');
    gArrow.drawRoundRect(0, 0, 30, 30, 4, 4, 4, 4);
    sArrow.x = x + 2;
    sArrow.y = y + 60;
    sArrow.rotation = 45;

    toolTipText.x = x + 20;
    toolTipText.y = y + 20;

    sMask.addEventListener('click', function(e) {
      self.removeToolTip(self);
    });
    self.toolTip.addChild(sMask, sArrow, sBox, toolTipText);
    self.stage.addChild(self.toolTip);
    self.stage.update();
  },

  removeToolTip:function(self) {
    self.stage.removeChild(self.toolTip);
    self.stage.update();
  },

  handlePlayBtnClick:function(e, self){
    var paused = !createjs.Ticker.getPaused(),
      playBtnImage;
    if (!self.alive || !paused) {
      playBtnImage = self.pauseBtn.image;

    } else {
      playBtnImage = self.clonePlayBtn.image;
    }
    if (!self.alive) {
      self.refresh(self, true);
    }
    self.playBtn.image = playBtnImage;
    createjs.Ticker.setPaused(paused);
    self.stage.update();
  },

  onTick:function(event){
    var self = this,
      paused = createjs.Ticker.getPaused(),
      mapType = self.mapType,
      kzStep = self.driveKZ.getStep(),
      ctStep = self.driveCT.getStep();

    if (paused) {
      return false;
    }

    if ((mapType === 'kz' && kzStep > 13) || (mapType === 'ct' && ctStep > 9)) {
      self.alive = false;
      createjs.Ticker.setPaused(true);
      self.playBtn.image = self.clonePlayBtn.image;
      self.stage.update();
      return createjs.Ticker.removeAllEventListeners();
    }

    var kzX = self.driveKZ.getX(),
      kzY = self.driveKZ.getY(),
      kzDistance = self.driveKZ.getDistance(),
      ctX = self.driveCT.getX(),
      ctY = self.driveCT.getY(),
      ctDistance = self.driveCT.getDistance(),

      kzAbsIndex = self.driveKZ.getAbsIndex(),
      ctAbsIndex = self.driveCT.getAbsIndex(),

      aniTruck1 = self.driveKZ.getAniTruck('aniTruck1'),
      aniTruck2 = self.driveKZ.getAniTruck('aniTruck2'),
      aniTruck3 = self.driveKZ.getAniTruck('aniTruck3'),
      aniTruck4 = self.driveKZ.getAniTruck('aniTruck4'),

      aniTruck1Ct = self.driveCT.getAniTruck('aniTruck1Ct'),
      aniTruck2Ct = self.driveCT.getAniTruck('aniTruck2Ct'),
      aniTruck3Ct = self.driveCT.getAniTruck('aniTruck3Ct'),
      aniTruck4Ct = self.driveCT.getAniTruck('aniTruck4Ct');

    // 快招物流
    switch (kzStep) {
      // 空车行驶
      case 0:
        self.block5.children[0].image = self.block5_1.image;
        self.driveKZ.drive(aniTruck3, self.cX + 120, self.cY - 50, 320, 'rightBottom');
        break;
      // 上货
      case 1:
        if (!aniTruck3[kzStep]) {
          aniTruck3.gotoAndPlay('in');
          aniTruck3[kzStep] = true;
        }
        break;
      // 重车
      case 2:
        aniTruck3.x = -100;
        self.driveKZ.drive(aniTruck4, kzX, kzY, 195, 'rightTop');
        break;
      // 重车
      case 3:
        aniTruck4.x = -100;
        self.driveKZ.drive(aniTruck1, kzX, kzY, 460, 'leftTop');
        break;
      // 卸货
      case 4:
        if (!aniTruck1[kzStep]) {
          aniTruck1.gotoAndPlay('out');
          self.driveCT.setStep(1);
          aniTruck1[kzStep] = true;
        }
        break;
      // 卸完货空车再继续行驶一小段
      case 5:
        self.driveKZ.drive(aniTruck1, kzX, kzY, 56, 'leftTop');
        break;
      // 换空车行驶
      case 6:
        aniTruck1.x = -100;
        self.driveKZ.drive(aniTruck2, kzX, kzY, mapType === 'kz' ? 283 : 192, 'leftBottom');
        break;
      // 上货
      case 7:
        // 如果是传统物流，直接跳到第 9 步
        if (mapType === 'ct') {
          self.driveKZ.setStep(9);
          break;
        }
        if (!aniTruck2[kzStep]) {
          aniTruck2.gotoAndPlay('in');
          aniTruck2[kzStep]= true;
        }
        break;
      // 重车
      case 8:
        self.driveKZ.drive(aniTruck2, kzX, kzY, 112, 'leftBottom');
        break;
      // 重车
      case 9:
        aniTruck2.x = -100;
        if (mapType === 'ct') {
          if (!aniTruck3[kzStep]) {
            aniTruck3.gotoAndPlay('empty');
            aniTruck3[kzStep] = true;
          }
          if (kzAbsIndex >= 198) {
            self.block5.children[0].image = self.block5_1.image;
            aniTruck3.x = -100;
          }
        }
        self.driveKZ.drive(aniTruck3, kzX, kzY, mapType ==='kz' ? 260 : 200, 'rightBottom');
        break;
      // 卸货
      case 10:
        if (mapType === 'ct') {
          self.driveKZ.setStep(14);
          break;
        }
        if (!aniTruck3[kzStep]) {
          aniTruck3.gotoAndPlay('out');
          aniTruck3[kzStep] = true;
        }
        break;
      // 卸货后继续行驶一小段
      case 11:
        self.driveKZ.drive(aniTruck3, kzX, kzY, 87, 'rightBottom');
        break;
      // 空车
      case 12:
        aniTruck3.x = -100;
        if (!aniTruck4[kzStep]) {
          aniTruck4.gotoAndPlay('empty');
          aniTruck4[kzStep] = true;
        }
        self.driveKZ.drive(aniTruck4, kzX, kzY, 195, 'rightTop');
        break;
      // 空车返回物流公司
      case 13:
        aniTruck4.x = -100;
        self.driveKZ.drive(aniTruck1, kzX, kzY, 125, 'leftTop');
        if (kzAbsIndex >= 120) {
          self.block5.children[0].image = self.block5Clone.children[0].image;
          aniTruck1.x = -100;
        }
        break;
    }

    // 传统物流
    if (mapType === 'ct') {
      switch (ctStep) {
        // 空车行驶
        case 1:
          self.block5.children[0].image = self.block5_2.image;
          self.driveCT.drive(aniTruck1Ct, self.cX + 120, self.cY - 50, 195, 'leftTop');
          break;
        // 空车行驶
        case 2:
          aniTruck1Ct.x = -100;
          self.driveCT.drive(aniTruck2Ct, ctX, ctY, 90, 'leftBottom');
          break;
        // 上货
        case 3:
          if (!aniTruck2Ct[ctStep]) {
            aniTruck2Ct.gotoAndPlay('in');
            aniTruck2Ct[ctStep]= true;
          }
          break;
        // 重车
        case 4:
          self.driveCT.drive(aniTruck2Ct, ctX, ctY, 103, 'leftBottom');
          break;
        // 重车
        case 5:
          aniTruck2Ct.x = -100;
          self.driveCT.drive(aniTruck3Ct, ctX, ctY, 304, 'rightBottom');
          break;
        // 卸货
        case 6:
          if (!aniTruck3Ct[ctStep]) {
            aniTruck3Ct.gotoAndPlay('out');
            aniTruck3Ct[ctStep]= true;
          }
          break;
        // 继续行驶一小段
        case 7:
          self.driveCT.drive(aniTruck3Ct, ctX, ctY, 37, 'rightBottom');
          break;
        // 空车返回
        case 8:
          aniTruck3Ct.x = -100;
          if (!aniTruck4Ct[kzStep]) {
            aniTruck4Ct.gotoAndPlay('empty');
            aniTruck4Ct[kzStep] = true;
          }
          self.driveCT.drive(aniTruck4Ct, ctX, ctY, 194, 'rightTop');
          break;
        // 返回物流公司
        case 9:
          aniTruck4Ct.x = -100;
          self.driveCT.drive(aniTruck1Ct, ctX, ctY, 125, 'leftTop');
          if (ctAbsIndex >= 120) {
            self.block5.children[0].image = self.block5Clone.children[0].image;
            aniTruck1Ct.x = -100;
          }
        default:
          break;
      }
    }
    if (self.mapType === 'kz') {
      self.createReckon(kzDistance, kzDistance * self.gasFp);
    } else {
      self.createReckon(ctDistance + kzDistance, (ctDistance + kzDistance) * self.gasFp);
    }
    self.stage.update(event);
  }


};

new CanvasMap().init();
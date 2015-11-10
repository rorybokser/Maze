Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};
Session.set("positionX", 0);
Session.set("positionY", 0);
var freeSpace = [];
for (i = 0; i < 10; i++){
  for (j = 0; j < 10; j++){
    freeSpace.push("" + i + j);
  }
}
var startFoodX = Math.floor(Math.random() * 10);
var startFoodY = Math.floor(Math.random() * 10);
Session.set("foodX", startFoodX);
Session.set("foodY", startFoodY);
Session.set("score", 0);
Session.set("shifts", 0);

Template.body.helpers({
  myScore: function() {
    return Session.get("score");
  },
  myShifts: function() {
    return Session.get("shifts");
  }
})

Template.mazeGame.helpers({

});

Template.mazeGame.events({
  "click .wall-shift": function(event) {
    var shifts = Session.get("shifts");
    if (shifts > 0){
      Session.set("shifts", shifts - 1);
      var id = event.target.id;
      var fix = id.charAt(2);
      var axis = id.charAt(1);
      var dir = id.charAt(0);
      var botLeft = (dir == 0);
      var i = botLeft ? 0 : 9;

      moveFood(fix, axis, dir);

      //for (i = 0; i < 10; i++){
      while ((botLeft && (i < 10)) || (!botLeft && (i > -1))) {
        var square = (axis == "x") ? "" + i + fix : "" + fix + i;
        // Remove visual wall and wall from array
        $("#" + square).removeClass("wallPos");
        index = freeSpace.indexOf("" + square);
        if (index < 0){
          freeSpace.push("" + square);
        }

        var diff;
        var squareNum = parseInt(square);
        if (axis == "x" && dir == "0") diff = 10;
        else if (axis == "x" && dir == "1") diff = -10;
        else if (axis == "y" && dir == "0") diff = 1;
        else if (axis == "y" && dir == "1") diff = -1;
        var nextSquare = squareNum + diff + "";
        if (nextSquare > -1 && nextSquare < 100 &&
         (Math.abs(nextSquare - squareNum) == 10) ||
          Math.floor(nextSquare/10) == Math.floor(squareNum/10)) {
          // Last condition so that the bottom row is not affected by the top of the next column
          nextSquare = (nextSquare.length < 2) ? "0" + nextSquare : "" + nextSquare;
          if (freeSpace.indexOf(nextSquare) < 0) {
            $("#" + square).addClass("wallPos");
            index = freeSpace.indexOf("" + square);
            if (index > -1){
              freeSpace.splice(index, 1);
            }
          }
        }
        i = botLeft ? i + 1 : i - 1; 
      }
    }
  }
})

moveFood = function(fix, axis, dir) {
  var posX = Session.get("positionX");
  var posY = Session.get("positionY");
  var foodX = parseInt(Session.get("foodX"));
  var foodY = parseInt(Session.get("foodY"));
  var inc = (dir == 1) ? 1 : -1;

  if (axis == "x") {
    if (posY == fix) Session.set("positionX", (posX + inc).mod(10));
    if (foodY == fix) Session.set("foodX", (foodX + inc).mod(10));
  } else if (axis == "y") {
    if (posX == fix) Session.set("positionY", (posY + inc).mod(10));
    if (foodX == fix) Session.set("foodY", (foodY + inc).mod(10));
  }
}

Template.mazeGame.onRendered( function(){

  Tracker.autorun( function() {
    var posX = Session.get("positionX");
    var posY = Session.get("positionY");
    var foodX = Session.get("foodX");
    var foodY = Session.get("foodY");
    
    $('.game-column').removeClass("curPos");
    $('#' + posX + posY).addClass("curPos");
    $('.game-column').removeClass("foodPos");
    $('#' + foodX + foodY).addClass("foodPos");
  });

  $(document).keydown(function(e) {
    var curX = Session.get("positionX");
    var curY = Session.get("positionY");
    switch(e.which) {
      case 37:
        motion(4, curX, curY);
      break;

      case 38:
        motion(1, curX, curY);
      break;

      case 39:
        motion(2, curX, curY);
      break;

      case 40:
        motion(3, curX, curY);
      break;

      default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
  });

})

inBounds = function(key, curX, curY) {
  // Also checks if the next space is a free one
  if (key == 1 && freeSpace.indexOf("" + curX + (curY + 1)) > -1) return true;
  if (key == 2 && freeSpace.indexOf("" + (curX + 1) + curY) > -1) return true;
  if (key == 3 && freeSpace.indexOf("" + curX + (curY - 1)) > -1) return true;
  if (key == 4 && freeSpace.indexOf("" + (curX - 1) + curY) > -1) return true;
  return false;
}

motion = function(which, curX, curY) {
  if (inBounds(which, curX, curY)) {
    ifAxisX = (which % 2 == 0);
    axisPos = ifAxisX ? curX : curY;
    upDown = (which < 3) ? 1 : -1;
    var newPosX;
    var newPosY;
    
    if (ifAxisX) {
      newPosX = axisPos + upDown;
      newPosY = curY;
      Session.set("positionX", newPosX);  
    } else {
      newPosY = axisPos + upDown;
      newPosX = curX;
      Session.set("positionY", newPosY);
    }
    
    var foodX = Session.get("foodX");
    var foodY = Session.get("foodY");
    if (newPosX == foodX && newPosY == foodY) {
      index = freeSpace.indexOf("" + foodX + foodY);
      if (index > -1){
        freeSpace.splice(index, 1);
      }
      if (freeSpace.length > 0){
        var randomIndex = Math.floor(Math.random() * freeSpace.length);
        Session.set("foodX", freeSpace[randomIndex].charAt(0));
        Session.set("foodY", freeSpace[randomIndex].charAt(1));
        Session.set("score", Session.get("score") + 1);
        Session.set("shifts", Session.get("shifts") + 1);
        $('#' + newPosX + newPosY).addClass("wallPos");
      }
    }
  } 
}
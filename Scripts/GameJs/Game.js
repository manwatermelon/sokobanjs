function Game() {

    this.CheckInterval = 20;

    var _map;
    var _imageRepository;
    var _canvas;
    var _canvasContext;
    var _canvasBuffer;
    var _canvasBufferContext;

    this._player = null;
    this.InitialUpdateDraw = null;

    this.GetPlayer = function () {
        return this._player;
    }

    this.Initialize = function () {
        _imageRepository = new ImageRepository();
        _map = new Map(_imageRepository);


        _canvas = document.getElementById('canvas');

        if (_canvas && _canvas.getContext) {

            _canvasContext = _canvas.getContext('2d');

            _canvasBuffer = document.createElement('canvas');
            _canvasBuffer.width = _canvas.width;
            _canvasBuffer.height = _canvas.height;
            _canvasBufferContext = _canvasBuffer.getContext('2d');
            $('#canvas').swipe( {
                swipe: function(event, direction, distance, duration, fingerCount) {
                    var e = jQuery.Event("keydown");
                    switch (direction) {
                        case "left":
                            //left
                            e.which = 65;
                            break;
                        case "right":
                            //right
                            e.which = 68;
                            break;
                        case "up":
                            //up
                            e.which = 87;
                            break;
                        case "down":
                            //down
                            e.which = 83;
                            break;
                        default:
                            break;
                    }
                    $('#canvas').trigger(e);
                },
                tap: function(event, target) {
                    
                },
                doubleTap: function(event, target) {
                    var e = jQuery.Event("keydown");
                    e.which = 32;
                    $('#canvas').trigger(e);
                },
                longTap: function(event, target) {
                    var e = jQuery.Event("keydown");
                    e.which = 32;
                    $('#canvas').trigger(e);
                },
                doubleTapThreshold:250
            });
            
            return true;
        }

        return false;
    }

    this.LoadContent = function () {

        var mapToLoad = "1";
        var cookie = $.cookie("sokoban");
        if (cookie != null) {
            //user already finished some maps
            mapToLoad = cookie;

        } else {
            $.cookie("sokoban", 1, {
                expires: 365
            });

        }

        _imageRepository.LoadContent();
        _map.LoadMap(mapToLoad);

        var sokoban = this;
        $(document).unbind('keydown').bind('keydown', function (event) {
            sokoban.Update(event);
            sokoban.Draw();
        });


        this.InitialUpdateDraw = setInterval(this.InitialUpdateRun, this.CheckInterval);
    }

    this.Run = function () {
        if (this.Initialize()) {
            // if initialization was succesfull, load content
            this.LoadContent();
        }

    }

    this.InitialUpdateRun = function (ev) {
        if (_map.Loaded && _imageRepository.Loaded()) {

            document.sokobanGame.Update(ev);
            document.sokobanGame.Draw();

            //we don't need timer anymore
            clearInterval(document.sokobanGame.InitialUpdateDraw);
        }
    }

    this.Update = function (event) {
        this._player = _map.GetPlayer();
        if (event) {
            if (event.which == 32) {
                //space pressed, advance the level
                _map.FinishCurrentLevel();
            } else if (event.which == 27) {
                //escape pressed, reset the level
                this.LoadContent();
            } else {
                this.GetPlayer().KeyCheck(event);
            }
        }
        _map.Update();

        if (_map.Finished) {
            if (_map.Number == 3) {
                //this is last map
                //                $("div#gameOverDialog").dialog("open");
                //                $(document).unbind('keydown');
                //                return;
                var nextLevel = 1;
                $.cookie("sokoban", nextLevel, {
                    expires: 365
                });
                document.sokobanGame.LoadContent();
            } else {
                var nextLevel = ++_map.Number;
                $.cookie("sokoban", nextLevel, {
                    expires: 365
                });
                document.sokobanGame.LoadContent();
            }
        }

    }

    this.Draw = function () {

        //clear canvas
        _canvasBufferContext.clearRect(0, 0, _canvas.width, _canvas.height);
        _canvasContext.clearRect(0, 0, _canvas.width, _canvas.height);

        //draw map to buffer
        _map.Draw(_canvasBufferContext);

        //draw buffer on screen
        _canvasContext.drawImage(_canvasBuffer, 0, 0);

    }
}
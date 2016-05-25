Webcam.attach('#my_camera');

var webcamData = new Array(2);
var intervalManager;
var triggerCounter = 0;
var triggerThreshold = 6;
var audio = new Audio('assets/Ding.wav');
var debugHidden = true;

//

function incThreshold()
{
    triggerThreshold++;
    document.getElementById("triggerThreshold").innerHTML = "Current Trigger Threshold: " + triggerThreshold + "%   ";

}

function decThreshold()
{
    triggerThreshold--;
    document.getElementById("triggerThreshold").innerHTML = "Current Trigger Threshold: " + triggerThreshold + "%   ";

}

function toggleDebug()
{
    if (debugHidden){
        debugHidden = false;
        document.getElementById("debugInfo").style.display = "block";
        document.getElementById("debugInfoToggle").innerHTML = "Hide";
    }
    else
    {
        debugHidden = true;
        document.getElementById("debugInfo").style.display = "none";
        document.getElementById("debugInfoToggle").innerHTML = "Show";
    }
}

function startInterval() {
    intervalManager = setInterval(take_snapshot, 3000);
}

function stopInterval() {
    clearInterval(intervalManager);
}


function take_snapshot() {

    Webcam.snap( function(data_uri) {
        if (document.getElementById('imgResult') == null) {
            webcamData[1] = data_uri;
            document.getElementById('my_result').innerHTML = '<img id = "imgResult" src="' + data_uri + '"/>';
        }
        else
        {
            webcamData[0] = webcamData[1];
            webcamData[1] = data_uri;
            document.getElementById('my_result').innerHTML = '<img id = "imgResult" src="' + webcamData[0] + '"/>';
            document.getElementById('my_result2').innerHTML = '<img id = "imgResult2" src="' + webcamData[1] + '"/>';
            getdiff()
        }
    } );
}

function take_snapshot() {

    Webcam.snap(function(data_uri) {
        if (document.getElementById('imgResult') == null) {
            webcamData[0] = data_uri;
            document.getElementById('my_result').innerHTML = '<img id = "imgResult" src="' + data_uri + '"/>';
        }
        else
        {
            webcamData[1] = webcamData[0];
            webcamData[0] = data_uri;
            document.getElementById('my_result').innerHTML = '<img id = "imgResult" src="' + webcamData[1] + '"/>';
            document.getElementById('my_result2').innerHTML = '<img id = "imgResult2" src="' + webcamData[0] + '"/>';
            getdiff()
        }
    } );
}


var grayScale = function(imageData)
{
    var pixelData = imageData.data;
    for (var i = 0; i< pixelData.length; i+=4)
    {
        var averaged = .34 * pixelData[i] + .5 * pixelData[i+1] + .16 * pixelData[i+2];
        pixelData[i] = pixelData[i+1] = pixelData[i+2] = averaged;
    }
    return imageData;
};

function sobel (px, ctx) {
    px = grayScale(px);
    var vertical = convoluteFloat32(px,
        [-1, -2, -1,
            0, 0, 0,
            1, 2, 1], false);
    var horizontal = convoluteFloat32(px,
        [-1, 0, 1,
            -2, 0, 2,
            -1, 0, 1], false);
    var id = ctx.createImageData(vertical.width, vertical.height);
    for (var i = 0; i < id.data.length; i += 4) {
        var v = Math.abs(vertical.data[i]);
        id.data[i] = v;
        var h = Math.abs(horizontal.data[i]);
        id.data[i + 1] = h;
        id.data[i + 2] = (h+v)/4;
        id.data[i + 3] = 255;
    }
    return id;
}

function convoluteFloat32 (pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);

    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;

    var w = sw;
    var h = sh;
    var output = {
        width: w, height: h, data: new Float32Array(w * h * 4)
    };
    var dst = output.data;

    var alphaFac = opaque ? 1 : 0;

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y * w + x) * 4;
            var r = 0, g = 0, b = 0, a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                    var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                    var srcOff = (scy * sw + scx) * 4;
                    var wt = weights[cy * side + cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                    a += src[srcOff + 3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
}

function getdiff()
{

    //NOTE: for the following, ARRAY[0] refers to reference image, ARRAY[1] refers to new Image
    var canvas = new Array(2); //represents canvases generated by images
    var images = new Array(2); //represents images
    var ctx = new Array(2); //represents canvas contexts
    var imageData = new Array(2); //represents imageData objects
    var data = new Array(2); //represents imageData subobject needed for our calculations
    canvas[0] = document.getElementById("canvas");
    canvas[1] = document.getElementById("canvas2");
    images[0] = document.getElementById("imgResult");
    images[1] = document.getElementById("imgResult2");
    ctx[0] = canvas[0].getContext('2d');
    ctx[1] = canvas[1].getContext('2d');

    canvas[0].width = images[0].width;
    canvas[0].height = images[0].height;
    ctx[0].drawImage(images[0], 0, 0);
    imageData[0] = ctx[0].getImageData(0,0,images[0].width, images[0].height);
    imageData[0] = grayScale(imageData[0]);
    ctx[0].putImageData(imageData[0], 0, 0);
    imageData[0] = sobel(imageData[0], ctx[0]);
    imageData[0] = grayScale(imageData[0]);
    data[0] = imageData[0].data;
    ctx[0].putImageData(imageData[0], 0, 0);

    canvas[1].width = images[1].width;
    canvas[1].height = images[1].height;
    ctx[1].drawImage(images[1], 0, 0);
    imageData[1] = ctx[1].getImageData(0,0,images[1].width, images[1].height);
    imageData[1] = grayScale(imageData[1]);
    ctx[1].putImageData(imageData[1], 0, 0);
    imageData[1] = sobel(imageData[1], ctx[1]);
    imageData[1] = grayScale(imageData[1]);
    data[1] = imageData[1].data;
    ctx[1].putImageData(imageData[1], 0, 0);


    var potentialTotal = 255; //maximum potential average difference between image 1 and 2;
    var differenceTotal = 0; //total pixel difference between images 1 and 2

    //increment by 3 for efficiency, because images are grayscale
    for(var i = 0; i < data[0].length;  i++)
    {
        //This loop handles different RBG values, something that is irrelevant now but might be later.
        differenceTotal += (data[1][i] - data[0][i]) * (data[1][i] - data[0][i]);
    }
    differenceTotal = Math.sqrt(differenceTotal/data[1].length).toFixed(2);

    var differenceRatio = (differenceTotal/potentialTotal).toFixed(3) * 100; //ratio measuring actual difference and potential difference
    console.log("Difference Total: " + differenceTotal);
    console.log("Potential Difference: " + potentialTotal);
    console.log("Difference Ratio: " + differenceRatio + "%");

    document.getElementById("totalDifference").innerHTML = "Total Difference: " + differenceTotal;
    document.getElementById("potentialDifference").innerHTML = "Potential Difference: " + potentialTotal;
    document.getElementById("differenceRatio").innerHTML = "Difference Ratio " + differenceRatio + "%";

    if (differenceRatio > triggerThreshold)
    {
        audio.play();
        triggerCounter += 1;
        document.getElementById("triggerCounter").innerHTML = "Total Differences Over Threshold: " + triggerCounter;
    }
}



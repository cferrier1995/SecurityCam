Webcam.attach('#my_camera');

function take_snapshot() {
    Webcam.snap( function(data_uri) {
        if (document.getElementById('imgResult') == null) {
            document.getElementById('my_result').innerHTML = '<img id = "imgResult" src="' + data_uri + '"/>';
        }
        else
        {
            document.getElementById('my_result2').innerHTML = '<img id = "imgResult2" src="' + data_uri + '"/>';
            getdiff()
        }
    } );
}

function getdiff()
{
    var canvas = new Array();
    var images = new Array();
    var ctx = new Array();
    var imageData = new Array;
    var data = new Array();
    canvas.push(document.getElementById("canvas"));
    canvas.push(document.getElementById("canvas2"));
    images.push(document.getElementById("imgResult"));
    images.push(document.getElementById("imgResult2"));
    ctx.push(canvas[0].getContext('2d'));
    ctx.push(canvas[1].getContext('2d'));


    canvas[0].width = images[0].width;
    canvas[0].height = images[0].height;
    ctx[0].drawImage(images[0], 0, 0);
    imageData.push(ctx[0].getImageData(0,0,images[0].width, images[0].height));
    data.push(imageData[0].data);

    canvas[1].width = images[1].width;
    canvas[1].height = images[1].height;
    ctx[1].drawImage(images[1], 0, 0);
    imageData.push(ctx[1].getImageData(0,0,images[1].width, images[1].height));
    data.push(imageData[1].data);

    var differenceTotal = 0;
    for(var i = 0; i < data[0].length-5; i += 4)
    {
        differenceTotal += Math.abs((data[1][i] + data[1][i+1] + data[1][i+2]) - (data[0][i] + data[0][i+1] + data[0][i+2]));
    }
    console.log(differenceTotal);
    document.getElementById("totalDifference").innerHTML = "Total Difference " + differenceTotal;
}


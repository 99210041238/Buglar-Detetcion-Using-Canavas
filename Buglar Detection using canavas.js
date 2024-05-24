<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"></script>
<script type="text/javascript">
    const URL = "https://teachablemachine.withgoogle.com/models/jLeJTw1rQ/";
    let model, webcam, ctx, labelContainer, maxPredictions;

    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const size = 400; // Increased video screen size
        const flip = true;
        webcam = new tmPose.Webcam(size, size, flip);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        const canvas = document.getElementById("canvas");
        canvas.width = size; canvas.height = size;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        document.getElementById("activityBtns").style.display = "flex";
        document.getElementById("stopBtn").style.display = "block";
    }

    function stopVideo() {
        webcam.stop();
        document.getElementById("activityBtns").style.display = "none";
        document.getElementById("stopBtn").style.display = "none";
    }

    function setActivity(activity) {
        const activityBtns = document.querySelectorAll("#activityBtns button");
        activityBtns.forEach(btn => btn.classList.remove("glow"));
        const selectedBtn = document.querySelector(`#activityBtns button:contains(${activity})`);
        selectedBtn.classList.add("glow");
        document.getElementById("output").innerHTML = `${activity} activity`;
    }

    async function loop(timestamp) {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const prediction = await model.predict(posenetOutput);

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;

            if (prediction[3].probability.toFixed(2) >= 0.98 ||
                prediction[4].probability.toFixed(2) >= 0.98 ||
                prediction[5].probability.toFixed(2) >= 0.98 ||
                prediction[6].probability.toFixed(2) >= 0.98 ||
                prediction[7].probability.toFixed(2) >= 0.98) {
                document.getElementById("output").innerHTML = "Suspicious activity";
                var audio = new Audio("https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3");
                audio.play();
            } else {
                document.getElementById("output").innerHTML = "Normal activity";
            }
        }

        drawPose(pose);
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }
</script>

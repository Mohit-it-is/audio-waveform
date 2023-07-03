document.addEventListener('DOMContentLoaded', function() {
    
    const audioFileInput = document.getElementById('audio-file-input');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const waveformCanvas = document.getElementById('waveform');
    const audioContext = createAudioContext();
    let audioBufferSource = null;
    let audioBuffer = null;
    let gainNode = null; 
    let chart = null;

    


    function createAudioContext() {
      return new (window.AudioContext || window.webkitAudioContext)();
    }
  
    function decodeAudioData(audioContext, audioData, callback) {
      audioContext.decodeAudioData(audioData, callback);
    }

    function drawChart() {
      chart = new Chart(waveformCanvas, {
        type: "line",
        data: {
            datasets: [{
            data: [],
            borderColor: 'rgb(75, 192, 192)',
      }]
    },
      });
    }
    
  
    function drawWaveformLineGraph(data, canvas) {
      const context = canvas.getContext('2d');
  
      const width = canvas.width;
      const height = canvas.height;
      const step = 4

      // console.log('data', data);

      drawChart();

      chart.data.datasets = [{
        data: data,
        borderColor: 'rgb(75, 192, 192)',
  }]

      console.log('chart data',chart,  chart.data);

      

      // context.clearRect(0, 0, width, height);
      // context.beginPath();




      // console.log('step', step);
      // console.log('data', data);
      // const amp = height/2;
  
      // context.clearRect(0, 0, width, height);
      // context.beginPath();
      // context.strokeStyle = '#3498db';
      // context.lineWidth = 2;
  
      // for (let i = 0; i < width; i++) {
      //   let min = 1.0;
      //   let max = -1.0;
      //   for (let j = 0; j < step; j++) {
      //     const value = data[i * step + j];
      //     if (value < min) min = value;
      //     if (value > max) max = value;
      //   }
      //   const x = i;
      //   const y = (1 + min) * amp;
      //   const h = Math.max(1, (max - min) * amp);
      //   context.moveTo(x, y);
      //   context.lineTo(x, y + h);
      // }
  
      // context.stroke();
    }
  
    audioFileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = function(e) {
        const audioData = e.target.result;
        decodeAudioData(audioContext, audioData, function(buffer) {
          audioBuffer = buffer;
          // startVisualization();
        });
      };
  
      reader.readAsArrayBuffer(file);
    });
    playBtn.addEventListener('click', function() {
      if (audioBuffer && !audioBufferSource) {
        audioBufferSource = audioContext.createBufferSource();
        audioBufferSource.buffer = audioBuffer;
  
        gainNode = audioContext.createGain(); 
        audioBufferSource.connect(gainNode);
        gainNode.connect(audioContext.destination);
  
        audioBufferSource.start();
        startVisualization();
      }
    });
  
    pauseBtn.addEventListener('click', function() {
      if (audioBufferSource) {
        audioBufferSource.stop();
        audioBufferSource = null;
        cancelAnimationFrame(animationFrameId);
      }
    });
  
    volumeSlider.addEventListener('input', function() {
      if (gainNode) {
        gainNode.gain.value = this.value;
      }
    });
  
    function startVisualization() {
      const analyser = audioContext.createAnalyser(); 
      analyser.fftSize = 2048;
  
      audioBufferSource.connect(analyser);
      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);
  
      const visualizationTypeElement = document.querySelector('input[name="visualization-type"]:checked');
      const visualizationType = visualizationTypeElement ? visualizationTypeElement.value : 'line-graph';
  
      function updateVisualization() {
        analyser.getFloatTimeDomainData(dataArray);
  
        if (visualizationType === 'line-graph') {
          console.log('data array', dataArray);
          drawWaveformLineGraph(dataArray, waveformCanvas);
        }
  
        animationFrameId = requestAnimationFrame(updateVisualization);
      }
  
      updateVisualization();
    }
  });
  
/* global Module */

/* Magic Mirror
 * Module: MMM-MHZ19
 */

Module.register("MMM-MHZ19", {
    defaults: {
        titleText: "Home CO2 level is",
        max_count: 2000,
        updateInterval: 10,
        sensorPIN: 11,
        width: 450,
        height: 200,
        chartConfig: {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    borderWidth: 5,
                    backgroundColor: "#FFFFFF",
                    borderColor: "#FFFFFF",
                    // backgroundColor: "gradient",
                    data: [
                        
                    ],
                    fill: true,
                }]
            },
            options: {
                legend: {
                    display: false
                },
                responsive: true,
                elements: {
                    point: {
                        radius: 0
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            maxTicksLimit: 6,
                            fontColor: "white",
                            fontSize: 18,
                            beginAtZero: true
                        },
                        gridLines: {
                            color: "#FFFFFF"
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: "white",
                            fontSize: 18,
                            beginAtZero: true
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'PPM CO2',
                            fontColor: "white",
                        },
                        gridLines: {
                            color: "#FFFFFF",
                        },
                    }]
                }
            }
        }
    },

    update: function () {
        this.sendSocketNotification('REQUEST-CO2');
    },

    start: function () {
        this.config = Object.assign({}, this.defaults, this.config);
        this.loaded = false;
        this.co2 = 'Load';
        Log.info("Starting module: " + this.name);
        this.update();
        setInterval(
            this.update.bind(this),
            // this.config.updateInterval * 1000);
            10 * 1000);
    },

    getScripts: function () {
        return [this.file('/node_modules/chart.js/dist/Chart.bundle.min.js')];
    },

    getStyles: function () {
        return ['MMM-MHZ19.css'];
    },


    getDom: function () {

        const wrapperEl = document.createElement("div");
        wrapperEl.setAttribute("style", "position: relative; display: inline-block; width: " + this.config.width + "px; height: " + this.config.height + "px;");


        var header = document.createElement("div");
        var label = document.createTextNode(this.config.titleText);
        header.className = 'header';
        header.id = "label_div";
        header.appendChild(label)
        wrapperEl.appendChild(header);

        // Create chart canvas
        const chartEl = document.createElement("canvas");
        chartEl.width = this.config.width;
        chartEl.height = this.config.height;
        gradient = chartEl.getContext('2d').createLinearGradient(0, 0, 0, this.config.height);
        gradient.addColorStop(0, 'rgba(255, 255,255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255,255, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.config.chartConfig.data.datasets[0].backgroundColor = gradient;

        // Init chart.js
        this.chart = new Chart(chartEl.getContext("2d"), this.config.chartConfig);

        // Append chart
        wrapperEl.appendChild(chartEl);
        return wrapperEl;
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'DATA-CO2') {

            this.co2 = payload.co2_value;
            this.loaded = 1;
            // console.log("DATA-CO2: " + payload.co2_value);

            var label_div = document.getElementById("label_div");
            label_div.innerHTML = (this.config.titleText + " " + this.co2 + "PPM");

            this.config.chartConfig.data.datasets[0].data.push(this.co2);
            this.config.chartConfig.data.labels.push(getTimeString());

            if (this.config.chartConfig.data.datasets[0].data.length > this.config.max_count) {
                this.config.chartConfig.data.datasets[0].data.splice(0, 1);
                this.config.chartConfig.data.labels.splice(0, 1);
            }

            this.chart.update();

            function checkTime(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }

            function getTimeString() {
                var today = new Date();
                var h = today.getHours();
                var m = today.getMinutes();
                var s = today.getSeconds();
                // add a zero in front of numbers<10
                m = checkTime(m);
                s = checkTime(s);
                return h + ":" + m;
                // return h + ":" + m + ":" + s;
            }
        }
    },

});

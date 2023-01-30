/**
  * REQUIRED
  * A ui-node must always begin with the following function.
  * module.exports = function(RED) {your code here}
  */
module.exports = function (RED) {

    /**
     * REQUIRED
     * A ui-node must always contain the following function.
     * function HTML(config) {}
     * This function will build the HTML necessary to display the lineargauge on the dashboard.
     * It will also pass in the node's config so that the parameters may be referenced from the flow editor.
     */
    function HTML(config) {
        var html = String.raw`
        <style>
    @-webkit-keyframes pulse {
        0% {
            box-shadow: 0 0 8px rgb(0, 255, 0), inset 0 0 8px rgb(0, 255, 0);
        }

        50% {
            box-shadow: 0 0 16px rgb(0, 255, 0), inset 0 0 14px rgb(0, 255, 0);
        }

        100% {
            box-shadow: 0 0 8px rgb(0, 255, 0), inset 0 0 8px rgb(0, 255, 0);
        }
    }

    .warning.hidden {
        display: none;
    }

    .warning.not-hidden {
        background-color: red;
        border-radius: 10px;
        padding: 5px;
        flex: 1;
    }

    .card {
        /* Add rounded corners and shadow to the card */
        border-radius: 8px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        /* Add some padding and margin to the card */
        padding: 16px;
        margin: 16px;

        /* Use flexbox to align the contents of the card */
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .machine-name {
        font-weight: bold;
        font-style: italic;
    }

    .card:hover {
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
        cursor: pointer;
    }

    .card-text p {
        padding: 0.5rem;
    }

    .card .led {
        /* Add a border and some padding to the LED */
        border: 0px solid rgba(0, 0, 0, 0.164);
        border-radius: 50%;
        width: 16px;
        height: 16px;
        margin: 8px;
        padding: 8px;
        align-self: left;
    }

    .led-container {
        width: 100%;
        align-items: left;
        flex: 1;
    }

    .card .led.red {
        /* Make the LED red when the boolean value is true */
        background-color: rgba(255, 0, 0, 0.7);
        align-self: left;
        box-shadow: 0 0 8px #ff0000, inset 0 0 8px #ff0000;
    }

    .card .led.green {
        /* Make the LED green when the boolean value is false */
        background-color: rgb(0, 255, 0);
        align-self: left;
        box-shadow: 0 0 8px rgb(0, 255, 0), inset 0 0 8px rgb(0, 255, 0);
        -webkit-animation: pulse 1s linear 0.5s infinite;
    }

    .card .stats {
        /* Add some padding and margin to the stats */
        padding: 8px;
        margin: 8px;

        /* Use flexbox to align the stats horizontally */
        display: flex;
        flex-direction: row;
        align-items: left;
    }

    .card .stats .label {
        /* Add some margin to the labels */
        margin: 8px;

        /* Align the text to the left */
        text-align: left;
    }
</style>

<div class="card" ng-click="send({payload: `+config.controlOutput+`})">
    <!-- LED -->
    <div class="led-container">
        <div class="led" ng-class="{'red':!msg.payload.isRunning, 'green':msg.payload.isRunning}"></div>
    </div>

    <!-- ALERT! -->

    <div class="warning" ng-class="{'hidden':!msg.payload.warning, 'not-hidden':msg.payload.warning}">ALERTA: 2 HORAS SIN FUNCIONAR
    </div>

    <!-- Machine stats -->
    <div class="stats">
        <div class="card-body">
            <div class="card-text">
                <p class="machine-name">`+config.machineName+` (`+config.machineSN+`))</p>
                <div></div>
                <p><b>Receta:</b> {{msg.payload.recipe}}</p>
                <p><b>Número de ciclos:</b> {{msg.payload.numCycles}}</p>
                <p><b>Tiempo mínimo de ciclo:</b> {{msg.payload.minCycleTime}}s</p>
                <p><b>Tiempo máximo de ciclo:</b> {{msg.payload.maxCycleTime}}s</p>
                <p><b>Tiempo produciendo:</b> {{msg.payload.timeProducing}}</p>
                <p><b>Tiempo detenida:</b> {{msg.payload.timeStopped}}</p>
                <p><b>Porcentaje de utilización:</b> {{msg.payload.perUtilization}}%</p>
            </div>
        </div>
    </div>
</div>
        `;
        return html;
    }
  
  
    /**
     * REQUIRED
     * A ui-node must always contain the following function.
     * This function will verify that the configuration is valid
     * by making sure the node is part of a group. If it is not,
     * it will throw a "no-group" error.
     * You must enter your node name that you are registering here.
     */
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_machinecard.error.no-group"));
            return false;
        }
        return true;
    }
  
    var ui = undefined; // instantiate a ui variable to link to the dashboard
  
    /**
     * REQUIRED
     * A ui-node must always contain the following function.
     * function YourNodeNameHere(config){}
     * This function will set the needed variables with the parameters from the flow editor.
     * It also will contain any Javascript needed for your node to function.
     *
     */
    function MachineCardNode(config) {
        try {
            var node = this;
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
  
            // placing a "debugger;" in the code will cause the code to pause its execution in the web browser
            // this allows the user to inspect the variable values and see how the code is executing
            //debugger;
  
            var done = null;
  
            if (checkConfig(node, config)) {
                var html = HTML(config);                    // *REQUIRED* get the HTML for this node using the function from above
                done = ui.addWidget({                       // *REQUIRED* add our widget to the ui dashboard using the following configuration
                    node: node,                             // *REQUIRED*
                    order: config.order,                    // *REQUIRED* placeholder for position in page
                    group: config.group,                    // *REQUIRED*
                    width: config.width,                    // *REQUIRED*
                    height: config.height,                  // *REQUIRED*
                    format: html,                           // *REQUIRED*
                    templateScope: "local",                 // *REQUIRED*
                    emitOnlyNewValues: false,               // *REQUIRED*
                    forwardInputMessages: false,            // *REQUIRED*
                    storeFrontEndInputAsState: false,       // *REQUIRED*
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function (msg) {
                        return { msg: msg };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) { return orig.msg; }
                    },
                    /**
                     * The initController is where most of the magic happens.
                     * This is the section where you will write the Javascript needed for your node to function.
                     * The 'msg' object will be available here.
                     */
                    initController: function ($scope) {
                        //debugger;
  
                        $scope.flag = true;                                         // not sure if this is needed?
                        $scope.$watch('msg', function (msg) {
  
                            if (!msg) {
                                // Ignore undefined msg
                                return;
                            }
                            $scope.numCycles = msg.payload.numCycles;
                            $scope.recipe = msg.payload.recipe;
                            $scope.minCycleTime = msg.payload.minCycleTime;
                            $scope.maxCycleTime = msg.payload.maxCycleTime;
                            $scope.isRunning = msg.payload.isRunning;
                            $scope.warning = msg.payload.warning;
                            $scope.timeProducing = msg.payload.timeProducing;
                            $scope.timeStopped = msg.payload.timeStopped;
                            $scope.perUtilization = msg.payload.perUtilization;
                        });
                    }
                });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);		// catch any errors that may occur and display them in the web browsers console
        }
  
        /**
         * REQUIRED
         * I'm not sure what this does, but it is needed.
         */
        node.on("close", function () {
            if (done) { done(); }
        });
    }
  
    /**
     *  REQUIRED
     * Registers the node with a name, and a configuration.
     * Type MUST start with ui_
     */
    RED.nodes.registerType("ui_machinecard", MachineCardNode);
  };
const BF1942PortalExtensions = (function () {
    const mouseCoords = {
        x: 0,
        y: 0
    };

    const copyToClipboard = (function () {
        const errorMessage = "Failed to copy to clipboard!";

        function precondition() {
            return "enabled";
        }

        async function callback(scope) {
            try {
                const xmlDom = _Blockly.Xml.blockToDom(scope.block);
                _Blockly.Xml.deleteNext(xmlDom);

                const xmlText = _Blockly.Xml.domToPrettyText(xmlDom);

                await navigator.clipboard.writeText(xmlText);
            }
            catch (e) {
                logError(errorMessage, e);

                alert(errorMessage);
            }
        }

        return {
            id: "copyToClipboard",
            displayText: "Copy to Clipboard",
            scopeType: _Blockly.ContextMenuRegistry.ScopeType.BLOCK,
            weight: 100,
            preconditionFn: precondition,
            callback: callback
        };
    })();

    const pasteFromClipboard = (function () {
        const errorMessage = "Failed to paste from clipboard!";

        //NOTE: Unfortunately precondition cannot be async, so we cannot check if the clipboard contains valid XML beforehand.
        function precondition() {
            return "enabled";
        }

        async function callback() {
            try {
                const xmlText = await navigator.clipboard.readText();

                if (!xmlText.startsWith("<block")) {
                    return;
                }

                const domText = `<xml xmlns="https://developers.google.com/blockly/xml">${xmlText}</xml>`;

                const xmlDom = _Blockly.Xml.textToDom(domText);
                const blockId = _Blockly.Xml.domToWorkspace(xmlDom, _Blockly.getMainWorkspace())[0];

                const block = _Blockly.getMainWorkspace().getBlockById(blockId);
                block.moveTo(mouseCoords);
            }
            catch (e) {
                logError(errorMessage, e);

                alert(errorMessage);
            }
        }

        return {
            id: "pasteFromClipboard",
            displayText: "Paste from Clipboard",
            scopeType: _Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
            weight: 100,
            preconditionFn: precondition,
            callback: callback
        };
    })();

    const openDocumentation = (function () {
        const documentationUrl = "https://bf2042.lennardf1989.com";

        function precondition() {
            return "enabled";
        }

        async function callback() {
            window.open(documentationUrl, "bf2142_documentation");
        }

        return {
            id: "openDocumentation",
            displayText: "Open Documentation",
            scopeType: _Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
            weight: 100,
            preconditionFn: precondition,
            callback: callback
        };
    })();

    //Based on: https://groups.google.com/g/blockly/c/LXnMujtEzJY/m/FKQjI4OwAwAJ
    document.addEventListener("mousedown", function (event) {       
        const mainWorkspace = _Blockly.getMainWorkspace();

        // Gets the x and y position of the cursor relative to the workspace's parent svg element.
        const mouseXY = _Blockly.utils.mouseToSvg(
            event,
            mainWorkspace.getParentSvg(),
            mainWorkspace.getInverseScreenCTM()
        );

        // Gets where the visible workspace starts in relation to the workspace's parent svg element.
        const absoluteMetrics = mainWorkspace.getMetricsManager().getAbsoluteMetrics();

        // In workspace coordinates 0,0 is where the visible workspace starts.
        mouseXY.x -= absoluteMetrics.left;
        mouseXY.y -= absoluteMetrics.top;

        // Takes into account if the workspace is scrolled.
        mouseXY.x -= mainWorkspace.scrollX;
        mouseXY.y -= mainWorkspace.scrollY;

        // Takes into account if the workspace is zoomed in or not.
        mouseXY.x /= mainWorkspace.scale;
        mouseXY.y /= mainWorkspace.scale;

        mouseCoords.x = mouseXY.x;
        mouseCoords.y = mouseXY.y;
    });

    function logError(message, error) {
        console.log(`[ERROR] ${message}`, error);
    }

    function init() {
        _Blockly.ContextMenuRegistry.registry.register(copyToClipboard);
        _Blockly.ContextMenuRegistry.registry.register(openDocumentation);
        _Blockly.ContextMenuRegistry.registry.register(pasteFromClipboard);
    }

    init();
})();
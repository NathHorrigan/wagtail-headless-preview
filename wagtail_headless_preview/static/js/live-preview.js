$(document).ready(() => {
    let $previewButton = $('.action-preview');
    // Make existing Wagtail code send form data to backend on KeyUp
    $previewButton.attr('data-auto-update', "true");

    // Trigger preview save on key up
    let $form = $('#page-edit-form');
    let previewUrl = $previewButton.data('action');
    let triggerPreviewDataTimeout = -1;
    let autoUpdatePreviewDataTimeout = -1;

    // Broadcast Channel settings
    let previewUpdates = null;

    const triggerPreviewUpdate = () => {
        return $.ajax({
            url: `${previewUrl}?mode=live-preview`,
            method: 'GET',
            data: new FormData($form[0]),
            processData: false,
            contentType: false
        }).then(res => {
            // Notify any local clients that the preview has changed
            if (previewUpdates == null)
                previewUpdates = new BroadcastChannel(`wagtail-preview-${res.token}`)
                console.log(`Sending update requests on channel: wagtail-preview-${res.token}`)
            previewUpdates.postMessage(res)
        })
    };

    const setPreviewData = () => {
        return $.ajax({
            url: previewUrl,
            method: 'POST',
            data: new FormData($form[0]),
            processData: false,
            contentType: false
        });
    };

    $previewButton.one('click', function () {
        if ($previewButton.data('auto-update')) {
            $form.on('click change keyup DOMSubtreeModified', function () {
                clearTimeout(triggerPreviewDataTimeout);
                triggerPreviewDataTimeout = setTimeout(triggerPreviewUpdate, 500);

                clearTimeout(autoUpdatePreviewDataTimeout);
                autoUpdatePreviewDataTimeout = setTimeout(setPreviewData, 300);
            }).trigger('change');
        }
    })
});

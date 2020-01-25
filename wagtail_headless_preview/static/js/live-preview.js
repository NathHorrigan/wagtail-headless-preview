$(document).ready(() => {
    let $previewButton = $('.action-preview');
    // Make existing Wagtail code send form data to backend on KeyUp
    $previewButton.attr('data-auto-update', "true");

    // Trigger preview save on key up
    let $form = $('#page-edit-form');
    let previewUrl = $previewButton.data('action');
    let triggerPreviewDataTimeout = -1;
    let autoUpdatePreviewDataTimeout = -1;

    const triggerPreviewUpdate = () => {
        return $.ajax({
            url: `${previewUrl}?mode=live-preview`,
            method: 'GET',
            data: new FormData($form[0]),
            processData: false,
            contentType: false
        }).then(res => {
            const previewUpdates = new BroadcastChannel(`wagtail-preview-${res.token}`)
            previewUpdates.postMessage(res)
            console.log(`posed to ${previewUpdates}`)
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

    const onChange = debounce(() => {
        setPreviewData().then(() => {
            triggerPreviewUpdate()
        })
    }, 50)

    $previewButton.one('click', function () {
        if ($previewButton.data('auto-update')) {
            $form.on('change keyup DOMSubtreeModified', onChange).trigger('change');
        }
    })
});

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

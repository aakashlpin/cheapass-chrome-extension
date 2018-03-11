document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.getSelected(null, (tab) => {
    const { url } = tab;
    var caPopup = '#caPopup';

    function showEmailInputToQueueProduct() {
      $('#caQueueForm [name="url"]').val(url);

      chrome.storage.local.get('cheapassUserEmail', (items) => {
        const email = items.cheapassUserEmail;
        if (email) {
          $('#caQueueForm').find('.email').val(email);
        }
      });

      $('#caQueueForm').on('submit', handleQueueFormSubmit);
    }

    function handleQueueFormSubmit(e) {
      e.preventDefault();
      var payload = $(this).serialize();
      $.ajax({
        method: 'POST',
        url: 'https://dash.cheapass.in/api/products',
        data: payload,
        success: queueResponseHandler,
        error: errorHandler,
      });

      var email = $('#caQueueForm').find('.email').val();
      chrome.storage.local.set({ cheapassUserEmail: email });
      $('#caQueueForm input').attr('disabled', 'disabled');
    }

    function errorHandler(res) {
      const response = res.responseJSON;
      const classname = 'caTextError';
      const messageDOM = '<p class="' + classname + '">' + response.error + '</p>' ;

      $('#caQueueForm')
        .find('.caTextError')
        .remove();

      $('#caQueueForm')
        .append(messageDOM);

      $('#caQueueForm input').removeAttr('disabled');
    }

    function queueResponseHandler(res) {
      var isError = res.error;
      var classname = isError ? 'caTextError' : 'caTextSuccess';
      var message = isError ? res.error : res.message;

      var messageDOM = '<p class="' + classname + '">' + message + '</p>'

      $('#caQueueForm')
        .find('.caTextError')
        .remove();

      if (isError) {
        $('#caQueueForm')
          .append(messageDOM);

        $('#caQueueForm input').removeAttr('disabled');

      } else {
        $('#caQueueForm')
          .find('input[type="submit"]')
          .remove()
          .end()
          .append(messageDOM);

        chrome.browserAction.setIcon({ path: 'icon-active.png' });
      }
    }

    showEmailInputToQueueProduct();

  })
})

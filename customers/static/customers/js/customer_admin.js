(function() {
    function getRow(fieldName) {
        return document.querySelector('.form-row.field-' + fieldName);
    }

    function toggleFields() {
        var freqEl = document.getElementById('id_collection_type');
        if (!freqEl) return;
        var freq = freqEl.value;
        var dailyRow = getRow('daily_collection_amount');
        var weeklyRow = getRow('weekly_collection_amount');

        if (freq === 'daily') {
            if (dailyRow) dailyRow.style.display = '';
            if (weeklyRow) weeklyRow.style.display = 'none';
        } else if (freq === 'weekly') {
            if (dailyRow) dailyRow.style.display = 'none';
            if (weeklyRow) weeklyRow.style.display = '';
        } else {
            if (dailyRow) dailyRow.style.display = '';
            if (weeklyRow) weeklyRow.style.display = '';
        }
    }

    function createLocationButton() {
        var longitudeRow = getRow('longitude');
        if (!longitudeRow || document.getElementById('use-live-location-btn')) {
            return;
        }

        var button = document.createElement('button');
        button.type = 'button';
        button.id = 'use-live-location-btn';
        button.textContent = 'Use live location';
        button.style.margin = '5px 0 10px';
        button.className = 'button';

        button.addEventListener('click', function() {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by this browser.');
                return;
            }
            button.disabled = true;
            button.textContent = 'Getting location...';
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var lat = document.getElementById('id_latitude');
                    var lng = document.getElementById('id_longitude');
                    if (lat) lat.value = position.coords.latitude.toFixed(6);
                    if (lng) lng.value = position.coords.longitude.toFixed(6);
                    button.textContent = 'Use live location';
                    button.disabled = false;
                },
                function() {
                    alert('Unable to get live location. Please allow location access and try again.');
                    button.textContent = 'Use live location';
                    button.disabled = false;
                },
                {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
            );
        });

        longitudeRow.parentNode.insertBefore(button, longitudeRow);
    }

    document.addEventListener('DOMContentLoaded', function() {
        toggleFields();
        createLocationButton();
        var freqEl = document.getElementById('id_collection_type');
        if (freqEl) freqEl.addEventListener('change', toggleFields);
    });
})();

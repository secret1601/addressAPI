async function getAccessToken() {
    const url = 'https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json';
    const consumerKey = '63a3f39c23a742e79762';
    const consumerSecret = '25499f64c2ac484e9899';

    try {
        const response = await fetch(`${url}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`);
        const data = await response.json();

        if (data.errCd === 0) {
            const accessToken = data.result.accessToken;
            return accessToken;
        } else {
            console.error('Error getting Access Token: ', data.errMsg);
            return null;
        }
    } catch (err) {
        console.error('Error getting Access Token: ', err);
        return null;
    }
}

async function fetchDataWithToken(url, accessToken) {
    try {
        const response = await fetch(`${url}?accessToken=${accessToken}`);
        const data = await response.json();

        if (data.errMsg === 'Success') {
            return data.result;
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error fetching data: ', err);
        return null;
    }
}

async function populateSelectBox(id, url, onChangeCallback, accessToken) {
    const select = document.getElementById(id);
    const data = await fetchDataWithToken(url, accessToken);

    if (data) {
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.cd;
            option.text = item.addr_name;
            select.appendChild(option);
        });
        select.addEventListener('change', onChangeCallback);
    }
}

async function handleAreaChange() {
    const selectedAreaCd = document.getElementById('areaList').value;
    const subAreaList = document.getElementById('subAreaList');

    subAreaList.innerHTML = '<option value="none">시/군/구</option>';

    const accessToken = await getAccessToken();
    if (accessToken) {
        const subAreaUrl = `https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json`;
        await populateSelectBox('subAreaList', subAreaUrl, null, accessToken + '&cd=' + selectedAreaCd);
    }
}

getAccessToken().then(accessToken => {
    if (accessToken) {
        populateSelectBox('areaList', 'https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json', handleAreaChange, accessToken)
    }
});
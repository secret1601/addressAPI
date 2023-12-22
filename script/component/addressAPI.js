class CreateAddressOption {
    constructor() {
        this.consumerKey = '63a3f39c23a742e79762';
        this.consumerSecret = '25499f64c2ac484e9899';
        // this.consumerKey = config.consumerKey;
        // this.consumerSecret = config.consumerSecret;;
        this.init();
    }

    getAccessToken = async () => {
        const url = 'https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json';

        try {
            const response = await fetch(`${url}?consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`);
            const data = await response.json();

            if (data.errCd === 0) {
                return data.result.accessToken;
            } else {
                console.error('Error getting Access Token: ', data.errMsg);
                return null;
            }
        } catch (err) {
            console.error('Error getting Access Token: ', err);
            return null;
        }
    };

    fetchDataWithToken = async (url, accessToken) => {
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
    };

    populateSelectBox = async (id, url, onChangeCallback, accessToken) => {
        const select = document.getElementById(id);
        const data = await this.fetchDataWithToken(url, accessToken);

        if (data) {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.cd;
                option.text = item.addr_name;
                select.appendChild(option);
            });
            select.addEventListener('change', onChangeCallback);
        }
    };

    handleAreaChange = async () => {
        const selectedAreaCd = document.getElementById('areaList').value;
        const subAreaList = document.getElementById('subAreaList');

        subAreaList.innerHTML = '<option value="none">시/군/구</option>';

        const accessToken = await this.getAccessToken();
        if (accessToken) {
            const subAreaUrl = `https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json`;
            await this.populateSelectBox('subAreaList', subAreaUrl, null, accessToken + '&cd=' + selectedAreaCd);
        }
    };

    init = async () => {
        const accessToken = await this.getAccessToken();
        if (accessToken) {
            const areaUrl = 'https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json';
            this.populateSelectBox('areaList', areaUrl, this.handleAreaChange, accessToken);
        }
    };
}

export { CreateAddressOption };

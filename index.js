const app = Vue.createApp({
    data(){
        return{
            apiData:{},
            showData:{},
            nowPage:{},
        };
    },
    methods:{
        getData(){            
        let apiUrl = 'https://api.kcg.gov.tw/api/service/Get/9c8e1450-e833-499c-8320-29b36b7ace5c';
        axios.get(apiUrl)
            .then((res) => {
            this.apiData = res.data.data.XML_Head.Infos.Info;
            this.pagination(this.apiData, 1);
            })
        },
        pagination(jsonData, nowPage){ 
            // 取得全部資料長度
            const dataTotal = jsonData.length;            

            // 設定要顯示在畫面上的資料數量
            // 預設每一頁只顯示 20 筆資料。
            const perpage = 20;
            
            // page 按鈕總數量公式 總資料數量 / 每一頁要顯示的資料
            // 這邊要注意，因為有可能會出現餘數，所以要無條件進位。
            const pageTotal = Math.ceil(dataTotal / perpage);
            
            // 當前頁數，對應現在當前頁數
            let currentPage = nowPage;
            
            // 因為要避免當前頁數筆總頁數還要多，假設今天總頁數是 3 筆，就不可能是 4 或 5
            // 所以要在寫入一個判斷避免這種狀況。
            // 當"當前頁數"比"總頁數"大的時候，"當前頁數"就等於"總頁數"
            // 注意這一行在最前面並不是透過 nowPage 傳入賦予與 currentPage，所以才會寫這一個判斷式，但主要是預防一些無法預期的狀況，例如：nowPage 突然發神經？！
            if (currentPage > pageTotal) {
                currentPage = pageTotal;
            }
            
            // 由前面可知 最小數字為 6 ，所以用答案來回推公式。
            const minData = (currentPage * perpage) - perpage + 1 ;
            const maxData = (currentPage * perpage) ;
            
            // 先建立新陣列
            let data = [];
            // 這邊將會使用 ES6 forEach 做資料處理
            // 首先必須使用索引來判斷資料位子，所以要使用 index
            jsonData.forEach((item, index) => {
                // 獲取陣列索引，但因為索引是從 0 開始所以要 +1。
                const num = index + 1;
                // 這邊判斷式會稍微複雜一點
                // 當 num 比 minData 大且又小於 maxData 就push進去新陣列。
                if ( num >= minData && num <= maxData) {
                data.push(item);
                }
            })
            this.showData = data;
            // 用物件方式來傳遞資料
            const page = {
                pageTotal,
                currentPage,
                hasPage: currentPage > 1,
                hasNext: currentPage < pageTotal,
            } 
            this.nowPage = page;           
        }, 
        switchPage(page){
            this.pagination(this.apiData,page)
        }       
    },
    created(){
        this.getData();
    }
});
app.component("card", {
    props: ["dissplay_data"],
    template: `
                <div class="col-md-6 py-2" v-for="data in dissplay_data" :key="data.id">
                  <div class="card">
                    <div class="card bg-dark text-white text-left">
                      <img class="card-img-top img-cover" :src="data.Picture1">
                      <div class="card-img-overlay d-flex justify-content-between align-items-end p-0 px-3"
                        style="background-color: rgba(0, 0, 0, .2)">
                        <h5 class="card-img-title-lg">{{data.Name}}</h5>
                        <h5 class="card-img-title-sm">{{data.Zone}}</h5>
                      </div>
                    </div>
                    <div class="card-body text-left">
                      <p class="card-text"><i class="far fa-clock fa-clock-time"></i>&nbsp;{{data.Opentime}}</p>
                      <p class="card-text"><i class="fas fa-map-marker-alt fa-map-gps"></i>&nbsp;{{data.Add}}</p>
                      <p class="card-text"><i class="fas fa-mobile-alt fa-mobile"></i>&nbsp;{{data.Tel}}</p>
                      <div v-if="!!data.Ticketinfo">
                        <p class="card-text"><i class="fas fa-tags text-warning"></i>&nbsp;{{data.Ticketinfo}}</p>
                      </div>
                    </div>
                  </div>
                </div>
      `
  });
app.component('pagination',{      
    props: ["page"],  
    methods:{
        changePage(page){
            // emit命名以及要向外傳遞的參數
            this.$emit('emit-page',page)           
        }
    },
    template: `
        <nav aria-label="Page navigation example">
            <ul class="pagination" id="pageid">
                <li class="page-item" :class="{'disabled': !page.hasPage}"><a class="page-link" href="#" :data-page="page.currentPage - 1" @click.prevent="changePage(page.currentPage - 1)">上一頁</a></li>
                <li class="page-item" :class="{'active':page.currentPage === item}" v-for="item in page.pageTotal" :key="item"><a class="page-link" href="#" :data-page="item" @click="changePage(item)">{{item}}</a></li>
                <li class="page-item" :class="{'disabled': !page.hasNext}"><a class="page-link" href="#" :data-page="page.currentPage + 1" @click.prevent="changePage(page.currentPage + 1)">下一頁</a></li>                
            </ul>
        </nav>
    `,   
})
app.mount('#app');
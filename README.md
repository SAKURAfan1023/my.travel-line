# TravelAI 代码仓库说明

本仓库包含三部分：智能行程生成（Python + CrewAI）、POI 数据管道、前端原型（React + Vite）。

## 1. 如何操纵

### 1.1 智能行程生成（命令行）
前置：安装 Python 依赖并配置环境变量。

- 安装依赖
  - `pip install -r requirements.txt`
- 配置环境变量（.env）
  - `DEEPSEEK_API_KEY`：LLM
  - `AMAP_KEY`：高德地图 API
  - `SERPER_API_KEY`：Serper 搜索
- 运行
  - `python main.py`

### 1.2 数据管道（POI 抓取 → 清洗 → 向量化）
前置：已配置 `AMAP_KEY`。

- 运行管道
  - `python data_pipeline/pipeline.py`
- 输出位置
  - `data_pipeline/data/raw_pois.csv`
  - `data_pipeline/data/cleaned_pois.csv`
  - `data_pipeline/data/chroma_db/`

### 1.3 Streamlit 简易界面
- `streamlit run app.py`

### 1.4 前端原型（本地 Vite）
前置：Node.js

- `cd front-end`
- `npm install`
- `npm run dev`

## 2. 文件结构

```
my.travel-line/
├── agents.py                 # CrewAI Agent 定义
├── tasks.py                  # 任务定义
├── main.py                   # 智能行程入口
├── tools/
│   └── map_tools.py          # 高德地图工具 + 路线优化
├── data_pipeline/
│   ├── fetch_pois.py         # 拉取 POI
│   ├── clean_data.py         # 清洗 POI
│   ├── vectorize_data.py     # 向量化写入 ChromaDB
│   ├── pipeline.py           # 一键管道入口
│   └── data/                 # 产出数据与向量库
└── front-end/
    ├── App.tsx               # 页面状态机
    ├── pages/                # 页面集合
    ├── contexts/             # 设置上下文
    ├── types.ts              # 类型定义
    └── package.json          # Vite 配置与脚本
```

## 3. 实现功能及其对应逻辑

### 3.1 智能行程生成
- `main.py` 负责创建 Agent、Task 并执行顺序流程
- `agents.py` 中定义两个角色：
  - 调研员：搜索并返回核心景点与基础信息
  - 规划师：组织路线并优化行程顺序
- `tasks.py` 中定义两类任务：
  - 任务1：景点调研与筛选
  - 任务2：路线优化 + Markdown 行程输出

### 3.2 地图与路线优化
- `map_tools.py` 提供：
  - 地理编码（地址 → 经纬度）
  - 路线通勤时间计算
  - 高德 POI 搜索
  - OR-Tools 的 TSP 路线优化
- 距离矩阵通过高德 `distance` API 构建，再交给 OR-Tools 求解

### 3.3 数据管道
- `fetch_pois.py`：高德 Place API 拉取 POI
- `clean_data.py`：清理缺失坐标、拆分经纬度、过滤低评分
- `vectorize_data.py`：使用 `sentence-transformers` 生成向量并存入 ChromaDB

### 3.4 前端原型
前端当前是静态交互原型，未接入后端 API。

- `App.tsx` 用 Screen 状态机切换页面
- `LocationSelectionPage` 完成目的地选择与篮子管理
- `PreferencesPage` 处理偏好、预算、日历范围和停留时长
- `ItineraryPage` 展示路线与时间轴
- `SettingsContext` 提供主题与语言切换

## 4. 技术栈与组织逻辑

### 4.1 技术栈
- 后端/AI：Python、CrewAI、LangChain（ChatOpenAI DeepSeek）、dotenv
- 数据管道：pandas、ChromaDB、sentence-transformers
- 路线优化：OR-Tools
- 地图服务：高德地图 API
- 搜索：Serper
- UI：Streamlit
- 前端：React 19、TypeScript、Vite、Tailwind CDN

### 4.2 组织逻辑图

#### 智能行程流程
```
用户输入
  ↓
main.py
  ↓
CrewAI Agents
  ├─ 调研员：Serper + AMap POI
  └─ 规划师：AMap 距离矩阵 + OR-Tools
  ↓
Markdown 行程结果
```

#### 数据管道流程
```
AMap POI API
  ↓
fetch_pois.py → raw_pois.csv
  ↓
clean_data.py → cleaned_pois.csv
  ↓
vectorize_data.py → ChromaDB
```

#### 前端原型流程
```
App.tsx(Screen 状态机)
  ↓
Landing → Location → Preferences → Itinerary → MyTrips
```

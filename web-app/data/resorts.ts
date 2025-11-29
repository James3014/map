// 雪場數據 - 使用真實的地理座標
export type RegionId =
    | 'hokkaido'
    | 'tohoku'
    | 'kanto'
    | 'chubu'
    | 'kansai'
    | 'chugoku-shikoku'
    | 'kyushu';

export interface Region {
    id: RegionId;
    name: string;
    color: string;
    prefectureCode: number[]; // 對應的都道府縣代碼
}

export interface Resort {
    id: string;
    name: string;
    nameEn: string;
    prefecture: string;
    region: RegionId;
    // 地圖上的實際位置（以 SVG viewBox 0-1000 為基準）
    position: {
        x: number;
        y: number;
    };
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tags?: string[];
}

// 區域資訊
export const REGIONS: Record<RegionId, Region> = {
    hokkaido: {
        id: 'hokkaido',
        name: '北海道',
        color: '#22d3ee',
        prefectureCode: [1]
    },
    tohoku: {
        id: 'tohoku',
        name: '東北',
        color: '#38bdf8',
        prefectureCode: [2, 3, 4, 5, 6, 7]
    },
    kanto: {
        id: 'kanto',
        name: '關東',
        color: '#60a5fa',
        prefectureCode: [8, 9, 10, 11, 12, 13, 14]
    },
    chubu: {
        id: 'chubu',
        name: '中部',
        color: '#818cf8',
        prefectureCode: [15, 16, 17, 18, 19, 20, 21, 22, 23]
    },
    kansai: {
        id: 'kansai',
        name: '關西',
        color: '#a78bfa',
        prefectureCode: [24, 25, 26, 27, 28, 29, 30]
    },
    'chugoku-shikoku': {
        id: 'chugoku-shikoku',
        name: '中國・四國',
        color: '#c084fc',
        prefectureCode: [31, 32, 33, 34, 35, 36, 37, 38, 39]
    },
    kyushu: {
        id: 'kyushu',
        name: '九州',
        color: '#e879f9',
        prefectureCode: [40, 41, 42, 43, 44, 45, 46, 47]
    },
};

// 日本雪場數據（座標基於 geolonia SVG 的 viewBox="0 0 1000 1000"）
export const RESORTS: readonly Resort[] = [
    // 北海道（地圖最上方，大約 x: 700-900, y: 50-250）
    {
        id: 'niseko_grand_hirafu',
        name: '二世谷比羅夫',
        nameEn: 'Niseko Grand Hirafu',
        prefecture: '北海道',
        region: 'hokkaido',
        position: { x: 750, y: 180 },
        difficulty: 'intermediate',
        tags: ['粉雪', '國際化', '夜滑'],
    },
    {
        id: 'rusutsu',
        name: '留壽都',
        nameEn: 'Rusutsu',
        prefecture: '北海道',
        region: 'hokkaido',
        position: { x: 770, y: 195 },
        difficulty: 'advanced',
        tags: ['粉雪', '大型度假村'],
    },
    {
        id: 'furano',
        name: '富良野',
        nameEn: 'Furano',
        prefecture: '北海道',
        region: 'hokkaido',
        position: { x: 810, y: 160 },
        difficulty: 'intermediate',
        tags: ['粉雪', '樹林'],
    },

    // 東北（x: 650-750, y: 400-500）
    {
        id: 'appi_kogen',
        name: '安比高原',
        nameEn: 'Appi Kogen',
        prefecture: '岩手',
        region: 'tohoku',
        position: { x: 710, y: 420 },
        difficulty: 'intermediate',
        tags: ['粉雪', '長雪季'],
    },
    {
        id: 'zao_onsen',
        name: '藏王溫泉',
        nameEn: 'Zao Onsen',
        prefecture: '山形',
        region: 'tohoku',
        position: { x: 660, y: 480 },
        difficulty: 'intermediate',
        tags: ['樹冰', '溫泉'],
    },
    {
        id: 'alts_bandai',
        name: '磐梯山',
        nameEn: 'Alts Bandai',
        prefecture: '福島',
        region: 'tohoku',
        position: { x: 680, y: 540 },
        difficulty: 'intermediate',
        tags: ['景觀', '多樣雪道'],
    },

    // 中部（長野、新潟 x: 520-580, y: 580-650）
    {
        id: 'hakuba_happo_one',
        name: '白馬八方尾根',
        nameEn: 'Hakuba Happo-One',
        prefecture: '長野',
        region: 'chubu',
        position: { x: 540, y: 630 },
        difficulty: 'advanced',
        tags: ['奧運場地', '長距離滑道'],
    },
    {
        id: 'hakuba_goryu',
        name: '白馬五龍',
        nameEn: 'Hakuba Goryu',
        prefecture: '長野',
        region: 'chubu',
        position: { x: 535, y: 635 },
        difficulty: 'intermediate',
        tags: ['家庭友善', '景觀'],
    },
    {
        id: 'nozawa_onsen',
        name: '野澤溫泉',
        nameEn: 'Nozawa Onsen',
        prefecture: '長野',
        region: 'chubu',
        position: { x: 555, y: 615 },
        difficulty: 'intermediate',
        tags: ['溫泉', '村莊氛圍'],
    },
    {
        id: 'shiga_kogen',
        name: '志賀高原',
        nameEn: 'Shiga Kogen',
        prefecture: '長野',
        region: 'chubu',
        position: { x: 545, y: 620 },
        difficulty: 'expert',
        tags: ['最大面積', '多樣雪道'],
    },
    {
        id: 'gala_yuzawa',
        name: 'GALA湯澤',
        nameEn: 'GALA Yuzawa',
        prefecture: '新潟',
        region: 'chubu',
        position: { x: 575, y: 590 },
        difficulty: 'beginner',
        tags: ['新幹線直達', '交通便利'],
    },
    {
        id: 'myoko_kogen',
        name: '妙高高原',
        nameEn: 'Myoko Kogen',
        prefecture: '新潟',
        region: 'chubu',
        position: { x: 520, y: 615 },
        difficulty: 'advanced',
        tags: ['深雪', '豐富降雪'],
    },
] as const;

/**
 * 獲取所有雪場（返回新數組，避免外部修改）
 */
export function getAllResorts(): Resort[] {
    return [...RESORTS];
}

/**
 * 根據 ID 查找雪場
 */
export function getResortById(id: string): Resort | undefined {
    return RESORTS.find(resort => resort.id === id);
}

/**
 * 根據區域獲取雪場
 */
export function getResortsByRegion(regionId: RegionId): Resort[] {
    return RESORTS.filter(resort => resort.region === regionId);
}

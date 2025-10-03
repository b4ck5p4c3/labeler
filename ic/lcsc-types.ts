export interface LCSCSearchResponse {
    readonly code: number;
    readonly msg: null;
    readonly result: Result;
    readonly ok: boolean;
}

export interface Result {
    readonly brandHomeVO: null;
    readonly wmCatalogVOS: null;
    readonly brandVOS: BrandVO[];
    readonly catalogVOS: CatalogVo[];
    readonly productSearchResultVO: ProductSearchResultVO;
    readonly productTotalPage: number;
    readonly isToDetail: null;
    readonly isToBrand: null;
    readonly tipProductDetailUrlVO: null;
    readonly brandUrlMap: null;
    readonly searchEngineProcess: SearchEngineProcess;
}

export interface BrandVO {
    readonly brandId: number;
    readonly brandNameEn: string;
    readonly productNum: number;
}

export interface CatalogVo {
    readonly catalogId: number;
    readonly parentId: number;
    readonly parentName: null | string;
    readonly catalogName: null;
    readonly catalogNameEn: string;
    readonly childCatelogs: CatalogVo[] | null;
    readonly productNum: number;
    readonly relationProductImage: null;
}

export interface ProductSearchResultVO {
    readonly totalCount: number;
    readonly currentPage: number;
    readonly pageSize: number;
    readonly productList: ProductList[];
}

export interface ProductList {
    readonly productId: number;
    readonly productCode: string;
    readonly productWeight: number;
    readonly foreignWeight: number | null;
    readonly weight: number;
    readonly dollarLadderPrice: null;
    readonly isForeignOnsale: boolean;
    readonly minBuyNumber: number;
    readonly maxBuyNumber: number;
    readonly isNotOverstock: boolean;
    readonly productCycle: string;
    readonly minPacketUnit: string;
    readonly productUnit: string;
    readonly productArrange: string;
    readonly minPacketNumber: number;
    readonly encapStandard: string;
    readonly productModel: string;
    readonly brandId: number;
    readonly brandNameEn: string;
    readonly catalogId: number;
    readonly catalogName: string;
    readonly parentCatalogId: number;
    readonly parentCatalogName: string;
    readonly productDescEn: null;
    readonly productIntroEn: string;
    readonly isHasBattery: boolean;
    readonly isForbid: null;
    readonly isDiscount: boolean;
    readonly isHot: boolean;
    readonly isEnvironment: boolean;
    readonly isPreSale: boolean;
    readonly productLadderPrice: null;
    readonly ladderDiscountRate: null;
    readonly productPriceList: ProductPriceList[];
    readonly isShowForeignPrice: boolean;
    readonly isRealPrice: boolean;
    readonly stockJs: number;
    readonly stockSz: number;
    readonly smtAloneNumberSz: null;
    readonly smtAloneNumberJs: null;
    readonly wmStockHk: number;
    readonly domesticStockVO: StockVo;
    readonly overseasStockVO: StockVo;
    readonly stockNumber: number;
    readonly split: number;
    readonly productImageUrl: string;
    readonly productImageUrlBig: string;
    readonly pdfUrl: string;
    readonly productImages: string[];
    readonly paramVOList: ParamVOList[];
    readonly wmParamVOList: null;
    readonly isReel: boolean;
    readonly reelPrice: number;
    readonly firstWmCatalogId: number;
    readonly firstWmCatalogNameEn: string;
    readonly secondWmCatalogId: number;
    readonly secondWmCatalogNameEn: string;
    readonly thirdWmCatalogId: number;
    readonly thirdWmCatalogNameEn: string;
    readonly wmCatalogId: number;
    readonly wmCatalogNameEn: string;
    readonly productModelHighlight: string;
    readonly productCodeHighlight: null;
    readonly encapStandardHighlight: null;
    readonly productArrangeHighlight: null;
    readonly brandNameEnHighlight: null;
    readonly catalogNameEnHighlight: null;
    readonly productIntroEnHighlight: null;
    readonly catalogCode: string;
    readonly parentCatalogCode: string;
    readonly pdfLinkUrl: null;
    readonly toleranceShowValue: string;
    readonly toleranceSortValue: number;
    readonly powerShowValue: string;
    readonly powerSortValue: number;
    readonly resistanceShowValue: string;
    readonly resistanceSortValue: number;
    readonly toleranceShowFlag: boolean;
    readonly powerShowFlag: boolean;
    readonly resistanceShowFlag: boolean;
    readonly moistureSensitivityLevel: string;
    readonly productCostPricePO: null;
    readonly szlcscActivityPO: null;
    readonly activityPO: null;
    readonly eccn: string | null;
    readonly url: string;
    readonly title: string;
    readonly hasThirdPartyStock: boolean;
    readonly maybeLook: null;
    readonly flashSaleProductPO?: null;
    readonly isAsianBrand: boolean | null;
    readonly "flashSalePr* Connection #0 to host wmsc.lcsc.com left intactoductPO"?: null;
}

export interface StockVo {
    readonly total: number;
    readonly shipImmediately: number;
    readonly ship3Days: number;
}

export interface ParamVOList {
    readonly paramCode: string;
    readonly paramName: string;
    readonly paramNameEn: string;
    readonly paramValue: string;
    readonly paramValueEn: string;
    readonly paramValueEnForSearch: number | null;
    readonly isMain: boolean;
    readonly sortNumber: number;
    readonly sort: number;
}

export interface ProductPriceList {
    readonly ladder: number;
    readonly productPrice: string;
    readonly usdPrice: number;
    readonly cnyProductPriceList: null;
    readonly discountRate: string;
    readonly currencyPrice: number;
    readonly currencySymbol: string;
    readonly isForeignDiscount: null;
    readonly ladderLevel: null;
}

export interface SearchEngineProcess {
    readonly preprocessedContent: string;
    readonly judgeProcess: string;
    readonly isNormal: null;
    readonly searchValidWord: string;
    readonly searchValidWordLight: null;
    readonly hasModelSuggest: null;
    readonly againJudgeHasResult: null;
    readonly hasReplaceKeyword: null;
    readonly judgeSuccessType: string[];
    readonly mappingCodeSet: null;
}

export interface LCSCSearchResponse {
  readonly code: number;
  readonly msg: null;
  readonly ok: boolean;
  readonly result: Result;
}

export interface Result {
  readonly brandHomeVO: null;
  readonly brandUrlMap: null;
  readonly brandVOS: BrandVO[];
  readonly catalogVOS: CatalogVo[];
  readonly isToBrand: null;
  readonly isToDetail: null;
  readonly productSearchResultVO: ProductSearchResultVO;
  readonly productTotalPage: number;
  readonly searchEngineProcess: SearchEngineProcess;
  readonly tipProductDetailUrlVO: null;
  readonly wmCatalogVOS: null;
}

export interface BrandVO {
  readonly brandId: number;
  readonly brandNameEn: string;
  readonly productNum: number;
}

export interface CatalogVo {
  readonly catalogId: number;
  readonly catalogName: null;
  readonly catalogNameEn: string;
  readonly childCatelogs: CatalogVo[] | null;
  readonly parentId: number;
  readonly parentName: null | string;
  readonly productNum: number;
  readonly relationProductImage: null;
}

export interface ProductSearchResultVO {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly productList: ProductList[];
  readonly totalCount: number;
}

export interface ProductList {
  readonly activityPO: null;
  readonly brandId: number;
  readonly brandNameEn: string;
  readonly brandNameEnHighlight: null;
  readonly catalogCode: string;
  readonly catalogId: number;
  readonly catalogName: string;
  readonly catalogNameEnHighlight: null;
  readonly dollarLadderPrice: null;
  readonly domesticStockVO: StockVo;
  readonly eccn: null | string;
  readonly encapStandard: string;
  readonly encapStandardHighlight: null;
  readonly firstWmCatalogId: number;
  readonly firstWmCatalogNameEn: string;
  readonly 'flashSalePr* Connection #0 to host wmsc.lcsc.com left intactoductPO'?: null;
  readonly flashSaleProductPO?: null;
  readonly foreignWeight: null | number;
  readonly hasThirdPartyStock: boolean;
  readonly isAsianBrand: boolean | null;
  readonly isDiscount: boolean;
  readonly isEnvironment: boolean;
  readonly isForbid: null;
  readonly isForeignOnsale: boolean;
  readonly isHasBattery: boolean;
  readonly isHot: boolean;
  readonly isNotOverstock: boolean;
  readonly isPreSale: boolean;
  readonly isRealPrice: boolean;
  readonly isReel: boolean;
  readonly isShowForeignPrice: boolean;
  readonly ladderDiscountRate: null;
  readonly maxBuyNumber: number;
  readonly maybeLook: null;
  readonly minBuyNumber: number;
  readonly minPacketNumber: number;
  readonly minPacketUnit: string;
  readonly moistureSensitivityLevel: string;
  readonly overseasStockVO: StockVo;
  readonly paramVOList: ParameterVOList[];
  readonly parentCatalogCode: string;
  readonly parentCatalogId: number;
  readonly parentCatalogName: string;
  readonly pdfLinkUrl: null;
  readonly pdfUrl: string;
  readonly powerShowFlag: boolean;
  readonly powerShowValue: string;
  readonly powerSortValue: number;
  readonly productArrange: string;
  readonly productArrangeHighlight: null;
  readonly productCode: string;
  readonly productCodeHighlight: null;
  readonly productCostPricePO: null;
  readonly productCycle: string;
  readonly productDescEn: null;
  readonly productId: number;
  readonly productImages: string[];
  readonly productImageUrl: string;
  readonly productImageUrlBig: string;
  readonly productIntroEn: string;
  readonly productIntroEnHighlight: null;
  readonly productLadderPrice: null;
  readonly productModel: string;
  readonly productModelHighlight: string;
  readonly productPriceList: ProductPriceList[];
  readonly productUnit: string;
  readonly productWeight: number;
  readonly reelPrice: number;
  readonly resistanceShowFlag: boolean;
  readonly resistanceShowValue: string;
  readonly resistanceSortValue: number;
  readonly secondWmCatalogId: number;
  readonly secondWmCatalogNameEn: string;
  readonly smtAloneNumberJs: null;
  readonly smtAloneNumberSz: null;
  readonly split: number;
  readonly stockJs: number;
  readonly stockNumber: number;
  readonly stockSz: number;
  readonly szlcscActivityPO: null;
  readonly thirdWmCatalogId: number;
  readonly thirdWmCatalogNameEn: string;
  readonly title: string;
  readonly toleranceShowFlag: boolean;
  readonly toleranceShowValue: string;
  readonly toleranceSortValue: number;
  readonly url: string;
  readonly weight: number;
  readonly wmCatalogId: number;
  readonly wmCatalogNameEn: string;
  readonly wmParamVOList: null;
  readonly wmStockHk: number;
}

export interface StockVo {
  readonly ship3Days: number;
  readonly shipImmediately: number;
  readonly total: number;
}

export interface ParameterVOList {
  readonly isMain: boolean;
  readonly paramCode: string;
  readonly paramName: string;
  readonly paramNameEn: string;
  readonly paramValue: string;
  readonly paramValueEn: string;
  readonly paramValueEnForSearch: null | number;
  readonly sort: number;
  readonly sortNumber: number;
}

export interface ProductPriceList {
  readonly cnyProductPriceList: null;
  readonly currencyPrice: number;
  readonly currencySymbol: string;
  readonly discountRate: string;
  readonly isForeignDiscount: null;
  readonly ladder: number;
  readonly ladderLevel: null;
  readonly productPrice: string;
  readonly usdPrice: number;
}

export interface SearchEngineProcess {
  readonly againJudgeHasResult: null;
  readonly hasModelSuggest: null;
  readonly hasReplaceKeyword: null;
  readonly isNormal: null;
  readonly judgeProcess: string;
  readonly judgeSuccessType: string[];
  readonly mappingCodeSet: null;
  readonly preprocessedContent: string;
  readonly searchValidWord: string;
  readonly searchValidWordLight: null;
}

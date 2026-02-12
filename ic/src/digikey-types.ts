export interface DigikeySearchResponse {
  readonly AppliedParametricFiltersDto: unknown[];
  readonly ExactMatches: ExactMatch[];
  readonly FilterOptions: FilterOptions;
  readonly Products: ExactMatch[];
  readonly ProductsCount: number;
  readonly SearchLocaleUsed: SearchLocaleUsed;
}

export interface ExactMatch {
  readonly BackOrderNotAllowed: boolean;
  readonly BaseProductNumber: BaseProductNumber;
  readonly Category: CategoryElement;
  readonly Classifications: Classifications;
  readonly DatasheetUrl: string;
  readonly DateLastBuyChance: null;
  readonly Description: Description;
  readonly Discontinued: boolean;
  readonly EndOfLife: boolean;
  readonly Manufacturer: BaseProductNumber;
  readonly ManufacturerLeadWeeks: string;
  readonly ManufacturerProductNumber: string;
  readonly ManufacturerPublicQuantity: number;
  readonly Ncnr: boolean;
  readonly NormallyStocking: boolean;
  readonly OtherNames: string[];
  readonly Parameters: Parameter[];
  readonly PhotoUrl: string;
  readonly PrimaryVideoUrl: null;
  readonly ProductStatus: ProductStatus;
  readonly ProductUrl: string;
  readonly ProductVariations: ProductVariation[];
  readonly QuantityAvailable: number;
  readonly Series: BaseProductNumber;
  readonly ShippingInfo: null;
  readonly UnitPrice: number;
}

export interface BaseProductNumber {
  readonly Id: number;
  readonly Name: string;
}

export interface CategoryElement {
  readonly CategoryId: number;
  readonly ChildCategories: CategoryElement[];
  readonly ImageUrl: string;
  readonly Name: Name;
  readonly NewProductCount: number;
  readonly ParentId: number;
  readonly ProductCount: number;
  readonly SeoDescription: string;
}

export enum Name {
  IntegratedCircuitsICS = 'Integrated Circuits (ICs)',
  Logic = 'Logic',
  TranslatorsLevelShifters = 'Translators, Level Shifters',
}

export interface Classifications {
  readonly ExportControlClassNumber: string;
  readonly HtsusCode: string;
  readonly MoistureSensitivityLevel: string;
  readonly ReachStatus: string;
  readonly RohsStatus: string;
}

export interface Description {
  readonly DetailedDescription: string;
  readonly ProductDescription: string;
}

export interface Parameter {
  readonly ParameterId: number;
  readonly ParameterText: string;
  readonly ParameterType: ParameterType;
  readonly ValueId: string;
  readonly ValueText: string;
}

export enum ParameterType {
  Double = 'Double',
  RangeUnitOfMeasure = 'RangeUnitOfMeasure',
  String = 'String',
}

export interface ProductStatus {
  readonly Id: number;
  readonly Status: string;
}

export interface ProductVariation {
  readonly DigiKeyProductNumber: string;
  readonly DigiReelFee: number;
  readonly MarketPlace: boolean;
  readonly MaxQuantityForDistribution: number;
  readonly MinimumOrderQuantity: number;
  readonly MyPricing: any[];
  readonly PackageType: BaseProductNumber;
  readonly QuantityAvailableforPackageType: number;
  readonly StandardPackage: number;
  readonly StandardPricing: StandardPricing[];
  readonly Supplier: BaseProductNumber;
  readonly TariffActive: boolean;
}

export interface StandardPricing {
  readonly BreakQuantity: number;
  readonly TotalPrice: number;
  readonly UnitPrice: number;
}

export interface FilterOptions {
  readonly Manufacturers: Manufacturer[];
  readonly MarketPlaceFilters: string[];
  readonly Packaging: Manufacturer[];
  readonly ParametricFilters: ParametricFilter[];
  readonly Series: Manufacturer[];
  readonly Status: Manufacturer[];
  readonly TopCategories: TopCategory[];
}

export interface Manufacturer {
  readonly Id: number;
  readonly ProductCount: null | number;
  readonly Value: string;
}

export interface ParametricFilter {
  readonly Category: Manufacturer;
  readonly FilterValues: FilterValue[];
  readonly ParameterId: number;
  readonly ParameterName: string;
  readonly ParameterType: ParameterType;
}

export interface FilterValue {
  readonly ProductCount: number;
  readonly RangeFilterType: null;
  readonly ValueId: string;
  readonly ValueName: string;
}

export interface TopCategory {
  readonly Category: RootCategoryClass;
  readonly ImageUrl: string;
  readonly RootCategory: RootCategoryClass;
  readonly Score: number;
}

export interface RootCategoryClass {
  readonly Id: number;
  readonly Name: Name;
  readonly ProductCount: number;
}

export interface SearchLocaleUsed {
  readonly Currency: string;
  readonly Language: string;
  readonly Site: string;
}

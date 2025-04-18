export interface DigikeySearchResponse {
  readonly Products:                    ExactMatch[];
  readonly ProductsCount:               number;
  readonly ExactMatches:                ExactMatch[];
  readonly FilterOptions:               FilterOptions;
  readonly SearchLocaleUsed:            SearchLocaleUsed;
  readonly AppliedParametricFiltersDto: any[];
}

export interface ExactMatch {
  readonly Description:                Description;
  readonly Manufacturer:               BaseProductNumber;
  readonly ManufacturerProductNumber:  string;
  readonly UnitPrice:                  number;
  readonly ProductUrl:                 string;
  readonly DatasheetUrl:               string;
  readonly PhotoUrl:                   string;
  readonly ProductVariations:          ProductVariation[];
  readonly QuantityAvailable:          number;
  readonly ProductStatus:              ProductStatus;
  readonly BackOrderNotAllowed:        boolean;
  readonly NormallyStocking:           boolean;
  readonly Discontinued:               boolean;
  readonly EndOfLife:                  boolean;
  readonly Ncnr:                       boolean;
  readonly PrimaryVideoUrl:            null;
  readonly Parameters:                 Parameter[];
  readonly BaseProductNumber:          BaseProductNumber;
  readonly Category:                   CategoryElement;
  readonly DateLastBuyChance:          null;
  readonly ManufacturerLeadWeeks:      string;
  readonly ManufacturerPublicQuantity: number;
  readonly Series:                     BaseProductNumber;
  readonly ShippingInfo:               null;
  readonly Classifications:            Classifications;
  readonly OtherNames:                 string[];
}

export interface BaseProductNumber {
  readonly Id:   number;
  readonly Name: string;
}

export interface CategoryElement {
  readonly CategoryId:      number;
  readonly ParentId:        number;
  readonly Name:            Name;
  readonly ProductCount:    number;
  readonly NewProductCount: number;
  readonly ImageUrl:        string;
  readonly SeoDescription:  string;
  readonly ChildCategories: CategoryElement[];
}

export enum Name {
  IntegratedCircuitsICS = "Integrated Circuits (ICs)",
  Logic = "Logic",
  TranslatorsLevelShifters = "Translators, Level Shifters",
}

export interface Classifications {
  readonly ReachStatus:              string;
  readonly RohsStatus:               string;
  readonly MoistureSensitivityLevel: string;
  readonly ExportControlClassNumber: string;
  readonly HtsusCode:                string;
}

export interface Description {
  readonly ProductDescription:  string;
  readonly DetailedDescription: string;
}

export interface Parameter {
  readonly ParameterId:   number;
  readonly ParameterText: string;
  readonly ParameterType: ParameterType;
  readonly ValueId:       string;
  readonly ValueText:     string;
}

export enum ParameterType {
  Double = "Double",
  RangeUnitOfMeasure = "RangeUnitOfMeasure",
  String = "String",
}

export interface ProductStatus {
  readonly Id:     number;
  readonly Status: string;
}

export interface ProductVariation {
  readonly DigiKeyProductNumber:            string;
  readonly PackageType:                     BaseProductNumber;
  readonly StandardPricing:                 StandardPricing[];
  readonly MyPricing:                       any[];
  readonly MarketPlace:                     boolean;
  readonly TariffActive:                    boolean;
  readonly Supplier:                        BaseProductNumber;
  readonly QuantityAvailableforPackageType: number;
  readonly MaxQuantityForDistribution:      number;
  readonly MinimumOrderQuantity:            number;
  readonly StandardPackage:                 number;
  readonly DigiReelFee:                     number;
}

export interface StandardPricing {
  readonly BreakQuantity: number;
  readonly UnitPrice:     number;
  readonly TotalPrice:    number;
}

export interface FilterOptions {
  readonly Manufacturers:      Manufacturer[];
  readonly Packaging:          Manufacturer[];
  readonly Status:             Manufacturer[];
  readonly Series:             Manufacturer[];
  readonly ParametricFilters:  ParametricFilter[];
  readonly TopCategories:      TopCategory[];
  readonly MarketPlaceFilters: string[];
}

export interface Manufacturer {
  readonly Id:           number;
  readonly Value:        string;
  readonly ProductCount: number | null;
}

export interface ParametricFilter {
  readonly Category:      Manufacturer;
  readonly ParameterType: ParameterType;
  readonly ParameterId:   number;
  readonly ParameterName: string;
  readonly FilterValues:  FilterValue[];
}

export interface FilterValue {
  readonly ProductCount:    number;
  readonly ValueId:         string;
  readonly ValueName:       string;
  readonly RangeFilterType: null;
}

export interface TopCategory {
  readonly RootCategory: RootCategoryClass;
  readonly Category:     RootCategoryClass;
  readonly Score:        number;
  readonly ImageUrl:     string;
}

export interface RootCategoryClass {
  readonly Id:           number;
  readonly Name:         Name;
  readonly ProductCount: number;
}

export interface SearchLocaleUsed {
  readonly Site:     string;
  readonly Language: string;
  readonly Currency: string;
}

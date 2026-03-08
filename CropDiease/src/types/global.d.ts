// 申明外部 npm 插件模块
declare module 'vue-grid-layout';
declare module 'qrcodejs2-fixes';
declare module 'splitpanes';
declare module 'js-cookie';
declare module '@wangeditor/editor-for-vue';
declare module 'js-table2excel';
declare module 'qs';

// 高德地图类型声明
declare namespace AMap {
	class Map {
		constructor(container: string | HTMLElement, options?: MapOptions);
		destroy(): void;
		setFitView(view?: Marker[] | Polyline[] | Polygon[] | Circle[] | any[], immediately?: boolean): void;
		setZoomAndCenter(zoom: number, center: [number, number], animation?: boolean): void;
		setZoom(zoom: number): void;
		setCenter(center: [number, number]): void;
		getZoom(): number;
		getCenter(): LngLat;
		getBounds(): Bounds;
		setBounds(bounds: Bounds, immediately?: boolean): void;
		addControl(control: any): void;
		removeControl(control: any): void;
		on(eventName: string, handler: Function): void;
		off(eventName: string, handler?: Function): void;
	}

	interface MapOptions {
		zoom?: number;
		center?: [number, number];
		mapStyle?: string;
		viewMode?: '2D' | '3D';
		pitch?: number;
		rotation?: number;
		showLabel?: boolean;
		showBuildingBlock?: boolean;
		features?: string[];
		[key: string]: any;
	}

	class LngLat {
		constructor(lng: number, lat: number);
		getLng(): number;
		getLat(): number;
		toArray(): [number, number];
	}

	class Bounds {
		constructor(southWest: LngLat, northEast: LngLat);
		contains(point: LngLat): boolean;
		getCenter(): LngLat;
	}

	class Marker {
		constructor(options?: MarkerOptions);
		setMap(map: Map | null): void;
		setPosition(position: [number, number] | LngLat): void;
		getPosition(): LngLat;
		setContent(content: string | HTMLElement): void;
		setLabel(options: any): void;
		on(eventName: string, handler: Function): void;
		off(eventName: string, handler?: Function): void;
	}

	interface MarkerOptions {
		position?: [number, number] | LngLat;
		offset?: Pixel;
		icon?: Icon | string;
		content?: string | HTMLElement;
		title?: string;
		zIndex?: number;
		angle?: number;
		draggable?: boolean;
		raiseOnDrag?: boolean;
		cursor?: string;
		visible?: boolean;
		clickable?: boolean;
		shape?: any;
		animation?: string;
		[key: string]: any;
	}

	class Pixel {
		constructor(x: number, y: number);
		getX(): number;
		getY(): number;
	}

	class Icon {
		constructor(options: IconOptions);
		setImageSize(size: Size): void;
		setImageOffset(offset: Pixel): void;
	}

	interface IconOptions {
		size?: Size;
		image?: string;
		imageOffset?: Pixel;
		imageSize?: Size;
	}

	class Size {
		constructor(width: number, height: number);
		getWidth(): number;
		getHeight(): number;
	}

	class DistrictSearch {
		constructor(options?: any);
		search(keyword: string | DistrictSearchOptions, callback: (status: string, result: DistrictSearchResult) => void): void;
		setLevel(level: string): void;
		setSubdistrict(level: number): void;
	}

	interface DistrictSearchOptions {
		level: string;
		subdistrict?: number;
		[key: string]: any;
	}

	interface DistrictSearchResult {
		districtList: District[];
	}

	interface District {
		adcode: string;
		name: string;
		center: LngLat;
		boundaries: any[];
		level: string;
	}

	class InfoWindow {
		constructor(options?: InfoWindowOptions);
		open(map: Map, position?: [number, number] | LngLat): void;
		close(): void;
		setContent(content: string | HTMLElement): void;
		setPosition(position: [number, number] | LngLat): void;
		getPosition(): LngLat;
		isOpen(): boolean;
	}

	interface InfoWindowOptions {
		content?: string | HTMLElement;
		isCustom?: boolean;
		autoMove?: boolean;
		closeWhenClickMap?: boolean;
		offset?: Pixel;
		size?: Size;
		position?: [number, number] | LngLat;
		showShadow?: boolean;
		[key: string]: any;
	}

	class Polyline {
		constructor(options?: PolylineOptions);
		setMap(map: Map | null): void;
		setPath(path: ([number, number] | LngLat)[]): void;
		getPath(): LngLat[];
	}

	interface PolylineOptions {
		path?: ([number, number] | LngLat)[];
		isOutline?: boolean;
		borderColor?: string;
		outlineColor?: string;
		borderWeight?: number;
		strokeColor?: string;
		strokeOpacity?: number;
		strokeWeight?: number;
		strokeStyle?: string;
		strokeDasharray?: number[];
		lineJoin?: string;
		lineCap?: string;
		zIndex?: number;
		showDir?: boolean;
		[key: string]: any;
	}

	class Polygon {
		constructor(options?: PolygonOptions);
		setMap(map: Map | null): void;
		setPath(path: ([number, number] | LngLat)[][]): void;
		getPath(): LngLat[][];
	}

	interface PolygonOptions {
		path?: ([number, number] | LngLat)[][];
		strokeColor?: string;
		strokeOpacity?: number;
		strokeWeight?: number;
		fillColor?: string;
		fillOpacity?: number;
		draggable?: boolean;
		zIndex?: number;
		[key: string]: any;
	}

	class Circle {
		constructor(options?: CircleOptions);
		setMap(map: Map | null): void;
		setCenter(center: [number, number] | LngLat): void;
		getCenter(): LngLat;
		setRadius(radius: number): void;
		getRadius(): number;
	}

	interface CircleOptions {
		center?: [number, number] | LngLat;
		radius?: number;
		strokeColor?: string;
		strokeOpacity?: number;
		strokeWeight?: number;
		fillColor?: string;
		fillOpacity?: number;
		strokeStyle?: string;
		zIndex?: number;
		[key: string]: any;
	}

	class MarkerClusterer {
		constructor(map: Map, markers: Marker[], options?: MarkerClustererOptions);
		addMarkers(markers: Marker[]): void;
		removeMarkers(markers: Marker[]): void;
		clearMarkers(): void;
		setMap(map: Map | null): void;
		getMarkers(): Marker[];
		getClusters(): any[];
		setMaxZoom(maxZoom: number): void;
		setGridSize(gridSize: number): void;
		setAverageCenter(averageCenter: boolean): void;
		setMinClusterSize(minClusterSize: number): void;
		setStyles(styles: any[]): void;
	}

	interface MarkerClustererOptions {
		gridSize?: number;
		maxZoom?: number;
		averageCenter?: boolean;
		minClusterSize?: number;
		styles?: any[];
		[key: string]: any;
	}

	class Geolocation {
		constructor(options?: GeolocationOptions);
		getCurrentPosition(callback?: (status: string, result: any) => void): void;
		watchPosition(callback?: (status: string, result: any) => void): void;
		clearWatch(): void;
	}

	interface GeolocationOptions {
		enableHighAccuracy?: boolean;
		timeout?: number;
		maximumAge?: number;
		convert?: boolean;
		showButton?: boolean;
		showMarker?: boolean;
		showCircle?: boolean;
		panToLocation?: boolean;
		zoomToAccuracy?: boolean;
		[key: string]: any;
	}

	namespace service {
		class Geocoder {
			constructor(options?: any);
			getAddress(location: LngLat, callback: (status: string, result: any) => void): void;
			getLocation(address: string, callback: (status: string, result: any) => void): void;
		}

		class PlaceSearch {
			constructor(options?: any);
			search(keyword: string, callback?: (status: string, result: any) => void): void;
			searchNearBy(keyword: string, center: LngLat, radius: number, callback?: (status: string, result: any) => void): void;
		}
	}
}

declare const AMap: typeof AMap;

// 声明一个模块，防止引入文件时报错
declare module '*.json';
declare module '*.png';
declare module '*.jpg';
declare module '*.scss';
declare module '*.ts';
declare module '*.js';

// 声明文件，*.vue 后缀的文件交给 vue 模块来处理
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

// 声明文件，定义全局变量
/* eslint-disable */
declare interface Window {
	nextLoading: boolean;
}

// 声明路由当前项类型
declare type RouteItem<T = any> = {
	path: string;
	name?: string | symbol | undefined | null;
	redirect?: string;
	k?: T;
	meta?: {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
		isDynamic?: boolean;
		isDynamicPath?: string;
		isIframeOpen?: string;
		loading?: boolean;
	};
	children: T[];
	query?: { [key: string]: T };
	params?: { [key: string]: T };
	contextMenuClickId?: string | number;
	commonUrl?: string;
	isFnClick?: boolean;
	url?: string;
	transUrl?: string;
	title?: string;
	id?: string | number;
};

// 声明路由 to from
declare interface RouteToFrom<T = any> extends RouteItem {
	path?: string;
	children?: T[];
}

// 声明路由当前项类型集合
declare type RouteItems<T extends RouteItem = any> = T[];

// 声明 ref
declare type RefType<T = any> = T | null;

// 声明 HTMLElement
declare type HtmlType = HTMLElement | string | undefined | null;

// 申明 children 可选
declare type ChilType<T = any> = {
	children?: T[];
};

// 申明 数组
declare type EmptyArrayType<T = any> = T[];

// 申明 对象
declare type EmptyObjectType<T = any> = {
	[key: string]: T;
};

// 申明 select option
declare type SelectOptionType = {
	value: string | number;
	label: string | number;
};

// 鼠标滚轮滚动类型
declare interface WheelEventType extends WheelEvent {
	wheelDelta: number;
}

// table 数据格式公共类型
declare interface TableType<T = any> {
	total: number;
	loading: boolean;
	param: {
		pageNum: number;
		pageSize: number;
		[key: string]: T;
	};
}

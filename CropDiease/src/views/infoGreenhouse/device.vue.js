import { ref, onMounted } from 'vue';
import { useGreenhouseApi } from '/@/api/greenhouse';
const greenhouseApi = useGreenhouseApi();
// 温室列表
const greenhouseList = ref([]);
const currentGreenhouseId = ref(1);
// 设备列表
const deviceList = ref([]);
const loading = ref(false);
// 防抖定时器
const debounceTimers = {};
// 防抖函数
const debounce = (fn, delay, deviceId) => {
    if (debounceTimers[deviceId]) {
        clearTimeout(debounceTimers[deviceId]);
    }
    debounceTimers[deviceId] = setTimeout(() => {
        fn();
        delete debounceTimers[deviceId];
    }, delay);
};
// 获取温室列表
const fetchGreenhouseList = async () => {
    try {
        const response = await greenhouseApi.getGreenhouseList({});
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            greenhouseList.value = data.map((item) => ({
                id: item.id,
                name: item.greenhouseName || `${item.id}号温室`
            }));
            if (greenhouseList.value.length > 0) {
                currentGreenhouseId.value = greenhouseList.value[0].id;
                fetchDeviceList();
            }
        }
    }
    catch (error) {
        console.error('获取温室列表失败:', error);
    }
};
// 获取设备列表
const fetchDeviceList = async () => {
    loading.value = true;
    try {
        const response = await greenhouseApi.getDevicesByGreenhouseId(currentGreenhouseId.value.toString());
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            deviceList.value = Array.isArray(data) ? data : [];
        }
    }
    catch (error) {
        console.error('获取设备列表失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 温室变化
const handleGreenhouseChange = () => {
    fetchDeviceList();
};
// 控制设备开关
const handleToggleDevice = async (device) => {
    const newStatus = device.currentStatus === 1 ? 0 : 1;
    try {
        const response = await greenhouseApi.controlDevice(device.id.toString(), {
            status: newStatus,
            operateUser: '管理员'
        });
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            device.currentStatus = newStatus;
        }
    }
    catch (error) {
        console.error('控制设备失败:', error);
    }
};
// 切换自动模式
const handleToggleAuto = async (device) => {
    const newIsAuto = device.isAuto === 1 ? 0 : 1;
    try {
        const response = await greenhouseApi.toggleAutoMode(device.id.toString(), {
            isAuto: newIsAuto
        });
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            device.isAuto = newIsAuto;
        }
    }
    catch (error) {
        console.error('切换自动模式失败:', error);
    }
};
// 调节设备数值
const handleValueChange = (device, value) => {
    device.currentValue = value;
    debounce(async () => {
        try {
            const response = await greenhouseApi.controlDevice(device.id.toString(), {
                status: device.currentStatus,
                value: value.toString(),
                operateUser: '管理员'
            });
            if (response.code !== '200' && response.code !== 200 && response.code !== '0' && response.code !== 0) {
                console.error('调节设备数值失败');
            }
        }
        catch (error) {
            console.error('调节设备数值失败:', error);
        }
    }, 500, device.id);
};
// 获取设备图标
const getDeviceIcon = (deviceType) => {
    const iconMap = {
        'temperature': '🌡️',
        'humidity': '💧',
        'irrigation': '🚿',
        'light': '💡',
        'shade': '☀️',
        'ventilation': '🌀',
        'co2': '🌫️'
    };
    return iconMap[deviceType] || '⚙️';
};
// 获取设备类型名称
const getDeviceTypeName = (deviceType) => {
    const nameMap = {
        'temperature': '温度控制',
        'humidity': '湿度控制',
        'irrigation': '灌溉系统',
        'light': '光照控制',
        'shade': '遮阳系统',
        'ventilation': '通风系统',
        'co2': 'CO2控制'
    };
    return nameMap[deviceType] || '未知类型';
};
onMounted(() => {
    fetchGreenhouseList();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['device-card']} */ ;
/** @type {__VLS_StyleScopedClasses['device-info']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['device-value']} */ ;
/** @type {__VLS_StyleScopedClasses['device-value']} */ ;
/** @type {__VLS_StyleScopedClasses['device-value']} */ ;
/** @type {__VLS_StyleScopedClasses['device-value']} */ ;
/** @type {__VLS_StyleScopedClasses['device-value']} */ ;
/** @type {__VLS_StyleScopedClasses['device-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['auto-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['device-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "device-control-container" },
});
/** @type {__VLS_StyleScopedClasses['device-control-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-header" },
});
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-actions" },
});
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.handleGreenhouseChange) },
    ...{ class: "greenhouse-select" },
    value: (__VLS_ctx.currentGreenhouseId),
});
/** @type {__VLS_StyleScopedClasses['greenhouse-select']} */ ;
for (const [gh] of __VLS_vFor((__VLS_ctx.greenhouseList))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (gh.id),
        value: (gh.id),
    });
    (gh.name);
    // @ts-ignore
    [handleGreenhouseChange, currentGreenhouseId, greenhouseList,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else if (__VLS_ctx.deviceList.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty" },
    });
    /** @type {__VLS_StyleScopedClasses['empty']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['device-grid']} */ ;
    for (const [device] of __VLS_vFor((__VLS_ctx.deviceList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (device.id),
            ...{ class: "device-card" },
        });
        /** @type {__VLS_StyleScopedClasses['device-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-header" },
        });
        /** @type {__VLS_StyleScopedClasses['device-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['device-icon']} */ ;
        (__VLS_ctx.getDeviceIcon(device.deviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-info" },
        });
        /** @type {__VLS_StyleScopedClasses['device-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (device.deviceName || '未知设备');
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "device-type" },
        });
        /** @type {__VLS_StyleScopedClasses['device-type']} */ ;
        (__VLS_ctx.getDeviceTypeName(device.deviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-status" },
        });
        /** @type {__VLS_StyleScopedClasses['device-status']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-badge" },
            ...{ class: ({ active: device.currentStatus === 1 }) },
        });
        /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        (device.currentStatus === 1 ? '开启' : '关闭');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-body" },
        });
        /** @type {__VLS_StyleScopedClasses['device-body']} */ ;
        if (device.controlMode === 'switch_slider') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "device-control" },
            });
            /** @type {__VLS_StyleScopedClasses['device-control']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "device-value" },
            });
            /** @type {__VLS_StyleScopedClasses['device-value']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.deviceList.length === 0))
                            return;
                        if (!(device.controlMode === 'switch_slider'))
                            return;
                        __VLS_ctx.handleValueChange(device, Number($event.target.value));
                        // @ts-ignore
                        [loading, deviceList, deviceList, getDeviceIcon, getDeviceTypeName, handleValueChange,];
                    } },
                type: "range",
                min: (device.minValue || 0),
                max: (device.maxValue || 100),
                value: (device.currentValue || 0),
                disabled: (device.currentStatus === 0),
                step: "0.1",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value-display" },
            });
            /** @type {__VLS_StyleScopedClasses['value-display']} */ ;
            ((device.currentValue || 0).toFixed(1));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "unit" },
            });
            /** @type {__VLS_StyleScopedClasses['unit']} */ ;
            (device.unit || '');
        }
        else if (device.controlMode === 'slider') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "device-control" },
            });
            /** @type {__VLS_StyleScopedClasses['device-control']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "device-value" },
            });
            /** @type {__VLS_StyleScopedClasses['device-value']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.deviceList.length === 0))
                            return;
                        if (!!(device.controlMode === 'switch_slider'))
                            return;
                        if (!(device.controlMode === 'slider'))
                            return;
                        __VLS_ctx.handleValueChange(device, Number($event.target.value));
                        // @ts-ignore
                        [handleValueChange,];
                    } },
                type: "range",
                min: (device.minValue || 0),
                max: (device.maxValue || 100),
                value: (device.currentValue || 0),
                step: "0.1",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value-display" },
            });
            /** @type {__VLS_StyleScopedClasses['value-display']} */ ;
            ((device.currentValue || 0).toFixed(1));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "unit" },
            });
            /** @type {__VLS_StyleScopedClasses['unit']} */ ;
            (device.unit || '');
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "device-control" },
            });
            /** @type {__VLS_StyleScopedClasses['device-control']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "device-info-text" },
            });
            /** @type {__VLS_StyleScopedClasses['device-info-text']} */ ;
            if (device.remark) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (device.remark);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['device-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "auto-badge" },
            ...{ class: ({ auto: device.isAuto === 1 }) },
        });
        /** @type {__VLS_StyleScopedClasses['auto-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['auto']} */ ;
        (device.isAuto === 1 ? '自动' : '手动');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "device-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['device-footer']} */ ;
        if (device.controlMode === 'switch' || device.controlMode === 'switch_slider') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.deviceList.length === 0))
                            return;
                        if (!(device.controlMode === 'switch' || device.controlMode === 'switch_slider'))
                            return;
                        __VLS_ctx.handleToggleDevice(device);
                        // @ts-ignore
                        [handleToggleDevice,];
                    } },
                ...{ class: "btn-toggle" },
                ...{ class: ({ active: device.currentStatus === 1 }) },
            });
            /** @type {__VLS_StyleScopedClasses['btn-toggle']} */ ;
            /** @type {__VLS_StyleScopedClasses['active']} */ ;
            (device.currentStatus === 1 ? '关闭' : '开启');
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.deviceList.length === 0))
                        return;
                    __VLS_ctx.handleToggleAuto(device);
                    // @ts-ignore
                    [handleToggleAuto,];
                } },
            ...{ class: "btn-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-auto']} */ ;
        (device.isAuto === 1 ? '切换手动' : '切换自动');
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

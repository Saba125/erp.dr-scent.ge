import React, { useMemo, useState, useEffect  } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Grid } from 'antd';
import Icon from '../util-components/Icon';
import  {getNavigationConfig}  from '../../configs/NavigationConfig';
import { useSelector, useDispatch } from 'react-redux';
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "../../constants/ThemeConstant";
import utils from '../../utils'
import { onMobileNavToggle } from '../../store/slices/themeSlice';
import Translate from '../../translate/tr_component';

const { useBreakpoint } = Grid;

const setLocale = (localeKey, isLocaleOn = true) =>
	isLocaleOn ? <Translate id={localeKey} /> : localeKey.toString();

const setDefaultOpen = (key) => {
	let keyList = [];
	let keyString = "";
	if (key) {
		const arr = key.split("-");
		for (let index = 0; index < arr.length; index++) {
			const elm = arr[index];
			index === 0 ? (keyString = elm) : (keyString = `${keyString}-${elm}`);
			keyList.push(keyString);
		}
	}
	return keyList;
};

const MenuItem = ({title, icon, path, disabled}) => {

	const dispatch = useDispatch();

	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

	const closeMobileNav = () => {
		if (isMobile) {
			dispatch(onMobileNavToggle(false))
		}
	}

	return (
		<>
			{icon && <Icon type={icon} /> }
			<span className={`${disabled ? 'text-muted' : ''}`}>{setLocale(title)}</span>
			{path && !disabled && <Link onClick={closeMobileNav} to={path} />}
		</>
	)
}

const getSideNavMenuItem = (navItem) => navItem.map(nav => {
	return {
		key: nav.key,
		label: <MenuItem title={nav.title} disabled={nav.disabled}  {...(nav.isGroupTitle ? {} : {path: nav.path, icon: nav.icon})} />,
		...(nav.isGroupTitle ? {type: 'group'} : {}),
		...(nav.submenu.length > 0 ? {children: getSideNavMenuItem(nav.submenu)} : {})
	}
})

const getTopNavMenuItem = (navItem) => navItem.map(nav => {
	return {
		key: nav.key,
		label: <MenuItem title={nav.title} icon={nav.icon} {...(nav.isGroupTitle ? {} : {path: nav.path})} />,
		...(nav.submenu.length > 0 ? {children: getTopNavMenuItem(nav.submenu)} : {})
	}
})

const SideNavContent = (props) => {
	const { routeInfo, hideGroupTitle, sideNavTheme = SIDE_NAV_LIGHT } = props;
	
	const user = useSelector(state => state.auth.user);
	const [menuItems,setMenuItems] = useState([])
	useEffect(()=>{
		setMenuItems(getSideNavMenuItem(getNavigationConfig(user?.user_type)))
	},[user])

	return (
		<Menu
			mode="inline"
			theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
			style={{ height: "100%", borderInlineEnd: 0 }}
			defaultSelectedKeys={[routeInfo?.key]}
			defaultOpenKeys={setDefaultOpen(routeInfo?.key)}
			className={hideGroupTitle ? "hide-group-title" : ""}
			items={menuItems}
		/>
	);
};

const TopNavContent = () => {

	const topNavColor = useSelector(state => state.theme.topNavColor);

	const menuItems = useMemo(() => getTopNavMenuItem(navigationConfig), [])

	return (
		<Menu 
			mode="horizontal" 
			style={{ backgroundColor: topNavColor }}
			items={menuItems}
		/>
	);
};

const MenuContent = (props) => {
	return props.type === NAV_TYPE_SIDE ? (
		<SideNavContent {...props} />
	) : (
		<TopNavContent {...props} />
	);
};

export default MenuContent;

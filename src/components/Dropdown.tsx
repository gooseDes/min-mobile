import { Colors, Constants } from "@/Style";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import Divider from "./Divider";
import DropdownItem from "./DropdownItem";

export interface DropdownProps {
    items: DropdownItemData[];
}

export interface DropdownHandler {
    open: (coords: { x: number; y: number }) => void;
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        backgroundColor: Colors.backgroundColor,
        borderRadius: Constants.rounding,
        borderWidth: Constants.borderWidth,
        borderColor: Colors.borderColor,
        width: 200,
        height: "auto",
        zIndex: 2,
    },
});

const Dropdown = forwardRef<DropdownHandler, DropdownProps>((props, ref) => {
    const { items } = props;

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const removeTimeout = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
        open: (coords: { x: number; y: number }) => {
            if (removeTimeout.current !== null) {
                clearTimeout(removeTimeout.current);
                removeTimeout.current = null;
            }
            setIsMounted(true);
            setPosition({ x: coords.x - 100, y: coords.y + 80 });
            setTimeout(() => setIsOpen(true));
        },
    }));

    const handleItemPress = (item: DropdownItemData) => {
        if (item.onPress) {
            item.onPress();
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) {
            removeTimeout.current = setTimeout(() => {
                removeTimeout.current = null;
                setIsMounted(false);
            }, 300);
        }
    }, [isOpen]);

    return (
        <>
            {isMounted && (
                <Animated.View
                    style={[
                        styles.container,
                        position && { top: position.y, left: position.x },
                        {
                            pointerEvents: isOpen ? "auto" : "none",
                            transform: [{ scaleY: isOpen ? 1 : 0 }],
                            transition: "transform 0.25s",
                            transitionTimingFunction: Constants.cubicBezier,
                        },
                    ]}
                >
                    {items.map((item, index) => (
                        <View key={index}>
                            {index > 0 && <Divider />}
                            <DropdownItem text={item.text} icon={item.icon} onClick={() => handleItemPress(item)} />
                        </View>
                    ))}
                </Animated.View>
            )}
        </>
    );
});

export default Dropdown;

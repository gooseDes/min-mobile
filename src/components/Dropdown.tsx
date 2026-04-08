import { Colors, Constants } from "@/Style";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Divider from "./Divider";
import DropdownItem from "./DropdownItem";

export interface DropdownProps {
    items?: DropdownItemData[];
}

export interface DropdownHandler {
    open: (coords: { x: number; y: number }) => void;
    setItems: (items: DropdownItemData[]) => void;
    getIsOpen: () => boolean;
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
    const [position, setPosition] = useState<Position | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [localItems, setLocalItems] = useState<DropdownItemData[]>(items || []);
    const removeTimeout = useRef<number | null>(null);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
        open: (coords: Position) => {
            if (removeTimeout.current !== null) {
                clearTimeout(removeTimeout.current);
                removeTimeout.current = null;
            }
            setIsMounted(true);
            setPosition(
                makePositionSafe(
                    { x: coords.x - styles.container.width / 2, y: coords.y },
                    styles.container.width,
                    50 * localItems.length,
                ),
            );
            setTimeout(() => setIsOpen(true));
        },
        setItems: (newItems: DropdownItemData[]) => {
            setLocalItems(newItems);
        },
        getIsOpen: () => isOpen,
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

    useEffect(() => {
        setLocalItems(items || []);
    }, [items]);

    function makePositionSafe(coords: Position, width: number, height: number): Position {
        let safeX = coords.x;
        let safeY = coords.y;
        if (coords.x + width > windowWidth - insets.right) {
            safeX = windowWidth - insets.right - width;
        } else if (coords.x < insets.left) {
            safeX = insets.left;
        }
        if (coords.y + height > windowHeight - insets.bottom) {
            safeY = windowHeight - insets.bottom - height;
        } else if (coords.y < insets.top) {
            safeY = insets.top;
        }

        return {
            x: safeX,
            y: safeY,
        };
    }

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
                            opacity: isOpen ? 1 : 0,
                            transition: "transform 0.25s, opacity 0.25s",
                            transitionTimingFunction: Constants.cubicBezier,
                        },
                    ]}
                >
                    {localItems.map((item, index) => (
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

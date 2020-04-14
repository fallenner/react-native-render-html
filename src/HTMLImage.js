import React, { PureComponent } from 'react';
import { Image, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';

export default class HTMLImage extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height,
            resized: false,
        };
    }

    static propTypes = {
        source: PropTypes.object.isRequired,
        alt: PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: Image.propTypes.style,
        imagesMaxWidth: PropTypes.number,
        imagesInitialDimensions: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number,
        }),
    };

    static defaultProps = {
        imagesInitialDimensions: {
            width: 100,
            height: 100,
        },
    };

    componentDidMount() {
        this.mounted = true;
        this.getImageSize();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate(prevProps, prevState) {
        this.getImageSize(this.props);
    }

    onImageLoad = ({
        nativeEvent: { width: originalWidth, height: originalHeight },
    }) => {
        const { imagesMaxWidth } = this.props;
        if (!imagesMaxWidth) {
            return (
                this.mounted &&
                this.setState({
                    width: originalWidth,
                    height: originalHeight,
                })
            );
        }
        const optimalWidth =
            imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
        const optimalHeight = (optimalWidth * originalHeight) / originalWidth;
        this.mounted &&
            this.setState({
                width: optimalWidth,
                height: optimalHeight,
                error: false,
                resized: true,
            });
    };

    getDimensionsFromStyle(style, height, width) {
        let styleWidth;
        let styleHeight;

        if (height) {
            styleHeight = height;
        }
        if (width) {
            styleWidth = width;
        }
        if (Array.isArray(style)) {
            style.forEach((styles) => {
                if (!width && styles['width']) {
                    styleWidth = styles['width'];
                }
                if (!height && styles['height']) {
                    styleHeight = styles['height'];
                }
            });
        } else {
            if (!width && style['width']) {
                styleWidth = style['width'];
            }
            if (!height && style['height']) {
                styleHeight = style['height'];
            }
        }

        return { styleWidth, styleHeight };
    }

    getImageSize(props = this.props) {
        const { style, height, width } = props;
        const { styleWidth, styleHeight } = this.getDimensionsFromStyle(
            style,
            height,
            width
        );
        if (styleWidth && styleHeight) {
            return (
                this.mounted &&
                this.setState({
                    width:
                        typeof styleWidth === 'string' &&
                        styleWidth.search('%') !== -1
                            ? styleWidth
                            : parseInt(styleWidth, 10),
                    height:
                        typeof styleHeight === 'string' &&
                        styleHeight.search('%') !== -1
                            ? styleHeight
                            : parseInt(styleHeight, 10),
                    resized: true,
                })
            );
        }
    }

    validImage(source, style, props = {}) {
        return (
            <View>
                {!this.state.resized && (
                    <FastImage
                        style={{
                            position: 'absolute',
                            zIndex: 1,
                            top: '25%',
                            left: '45%',
                            width: 32,
                            height: 32,
                        }}
                        source={require('./img/loading.gif')}
                    />
                )}
                <FastImage
                    onLoad={this.onImageLoad}
                    source={source}
                    resizeMode={FastImage.resizeMode.contain}
                    style={[
                        style,
                        {
                            width: this.state.width,
                            height: this.state.height,
                            maxWidth: '100%',
                        },
                    ]}
                    {...props}
                />
            </View>
        );
    }

    get errorImage() {
        return (
            <View
                style={{
                    width: 50,
                    height: 50,
                    borderWidth: 1,
                    borderColor: 'lightgray',
                    overflow: 'hidden',
                    justifyContent: 'center',
                }}
            >
                {this.props.alt ? (
                    <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>
                        {this.props.alt}
                    </Text>
                ) : (
                    false
                )}
            </View>
        );
    }

    render() {
        const { source, style, passProps } = this.props;

        return !this.state.error
            ? this.validImage(source, style, passProps)
            : this.errorImage;
    }
}
